import { Address, Client } from "nimiq-rpc-client-ts";
import { resolve } from "path";
import { Config } from "../config";
import { Action, Result } from "../types";
import { Actions } from "./Actions";
import { Report } from "./Report";
import { ValidatorsPool } from "./ValidatorsPool";
import { createOuputFolder, sleep } from "./utils";
import { log } from "console";

type ActionResult = {
    hash: string,
};

type Context = {
    action: Action
    address?: Address
}

export class MonkeyChaos {
    static client: Client;
    pool: ValidatorsPool;
    actions: Actions;
    report: Report;
    monkeyChaosConfig: Config["monkeyChaosConfig"];
    albatrossConfig: Config["albatrossConfig"];
    output: string;
    
    constructor(client: Client, {albatrossConfig, monkeyChaosConfig}: Config) {
        const { scenario } = monkeyChaosConfig;
        MonkeyChaos.client = client;
        this.pool = new ValidatorsPool(scenario.probabilities);
        this.actions = new Actions(this);
        this.report = new Report(this);
        this.monkeyChaosConfig = monkeyChaosConfig;
        this.albatrossConfig = albatrossConfig;
        this.output = createOuputFolder(monkeyChaosConfig.validator.output_logs).data!;
    }

    async init() {
        await this.printInitialState();

        const { next, close } = await MonkeyChaos.client.block.election.subscribe();
        this.pool = new ValidatorsPool(this.probabilities);
        // this.genesisValidators.forEach(v => this.pool.changeValidatorStatus(v, 'active')); // all genesis validators are considered active
        next(({data: electionBlock}) => {
            if(electionBlock) {
                this.report.log('🙈', `Election block ${electionBlock} reached. Processing deactivations...`);
                this.pool.processDeactivate();
            }
        });

        await this.loop()
        close();

        this.printReport();
    }

    get donator() {
        return this.albatrossConfig.donator;
    }

    get cycles() {
        return this.monkeyChaosConfig.scenario.cycles;
    }

    set cycles(cycles: number) {
        this.monkeyChaosConfig.scenario.cycles = cycles;
    }

    get genesisValidators() {
        return this.albatrossConfig.validators;
    }

    get timer() {
        return this.monkeyChaosConfig.scenario.timer;
    }

    get probabilities() {
        return this.monkeyChaosConfig.scenario.probabilities;
    }

    get binPath() {
        const relativePath = this.monkeyChaosConfig.validator.node_binary_path;
        return resolve(process.cwd(), relativePath);
    }

    async loop() {
        while (this.cycles > 0) {
            this.cycles--;

            console.group(`\n\n🐒  Monkey Chaos Loop (${this.cycles})`)
            this.report.printProbabilities()
    
            const { data, error, action, address } = await this.actions.run()
    
            this.report.log('🙊', `Monkey chose to ${action} validator ${address || ''}`);
            
            await this.report.addEvent(action, address, data?.hash || '');

            if (error) {
                this.report.log('🙊', `Monkey failed to ${action} with error: ${error}`);
            }
    
            this.report.print();
            this.report.log('🙈', `Sleeping for ${this.timer} seconds...`)
            await sleep(this.getRandomSeconds());
    
            console.groupEnd()
        }
    }

    async run(): Promise<Result<ActionResult> & Context> {
        const { action, validator, onSucess } = this.pool.getVictim();
        const address = validator?.validator_address
        switch (action) {
            case 'deactivate':
                const deactivateRes = await this.actions.sendTx('deactivate', validator)
                if(deactivateRes.data) {
                    onSucess();
                    return { data: { hash: deactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: deactivateRes.error, address }
            case 'reactivate':
                const reactivateRes = await this.actions.sendTx('reactivate', validator)
                if(reactivateRes.data) {
                    onSucess();
                    return { data: { hash: reactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: reactivateRes.error, address }
            case 'create':
                const createValidatorRes = await this.actions.createValidator()
                if(createValidatorRes.data) {
                    onSucess(createValidatorRes.data.validator);
                    return { data: { hash: createValidatorRes.data.hash }, address: createValidatorRes.data.validator.validator_address, action, error: undefined }
                }
                return { data: undefined, action, error: createValidatorRes.error, address }
            case 'delete':
                const deleteRes = await this.actions.removeValidator(validator)
                if(deleteRes.data) {
                    onSucess();
                    return { data: { hash: deleteRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: deleteRes.error, address }
        }
    }

    getRandomSeconds() {
        const timer = this.timer;
        let randomTime: number;
        if (typeof timer === 'number') randomTime = timer;
        else randomTime = Math.floor(Math.random() * (timer[1] - timer[0])) + timer[0];
        return randomTime * 1000;
    }

    async printInitialState(){
        console.log(`🐒  Starting Monkey Chaos...`)
    
        const policy = await MonkeyChaos.client.constant.params();
        if (policy.error) throw new Error(policy.error.message);
        console.log(`🐵  The current policy is:`)
        console.table(policy.data)
    
        const timer = this.timer
        const timerStr = typeof timer === 'number' ? timer : timer.join('-')
    
        console.log(`🐵  It will run ${this.cycles} in intervals of ${timerStr}s times with the following probabilities:`)
        this.report.printProbabilities()
    
        console.log(`🐵  The state of the validators is:`)
        this.report.print()
    }

    printReport(){
        console.log(`🐒  Monkey Chaos finished...`)
        console.log(`📝  Report:`)
        console.table(this.report)
    }
}