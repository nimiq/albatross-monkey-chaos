import { Address, Client, MacroBlock } from "nimiq-rpc-client-ts";
import { resolve } from "path";
import { Config } from "../config";
import { Action, Result } from "../types";
import { ActionResult, Actions, Context } from "./Actions";
import { Report } from "./Report";
import { ValidatorsPool } from "./ValidatorsPool";
import { createOuputFolder, sleep } from "./utils";
import { parseTxData } from "albatross-util-wasm";

export class MonkeyChaos {
    static client: Client;
    pool: ValidatorsPool;
    actions: Actions;
    report: Report;
    monkeyChaosConfig: Config["monkeyChaosConfig"];
    albatrossConfig: Config["albatrossConfig"];
    output: string;

    constructor(client: Client, { albatrossConfig, monkeyChaosConfig }: Config) {
        const { scenario } = monkeyChaosConfig;
        MonkeyChaos.client = client;
        this.pool = new ValidatorsPool(scenario.probabilities);
        this.actions = new Actions(this);
        this.output = createOuputFolder(monkeyChaosConfig.validator.output_logs).data!;
        this.report = new Report(this);
        this.monkeyChaosConfig = monkeyChaosConfig;
        this.albatrossConfig = albatrossConfig;
    }

    async init() {
        await this.report.printInitialState();

        const { next, close } = await MonkeyChaos.client.block.subscribe({ filter: 'FULL' });
        this.pool = new ValidatorsPool(this.probabilities);
        // this.genesisValidators.forEach(v => this.pool.changeValidatorStatus(v, 'active')); // all genesis validators are considered active
        next((block) => {
            if ((block.data as MacroBlock).isElectionBlock) {
                this.report.log({ emoji: '🎉🎉🎉', message: `Election block (epoch ${(block.data as MacroBlock).epoch}) reached. Processing ${this.pool.requestedDeactivate.size} deactivations...` });
                this.pool.processDeactivate();
            }
        });

        await this.loop()
        close();

        await this.fillEventsWithTx();
        this.report.printReport();
        this.report.saveEvents();

        this.report.log({ emoji: '🐒', message: 'Monkey Chaos finished...' });
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
            const cycleStatus = await this.actions.run()
            this.handleState(cycleStatus);
            await sleep(this.getRandomSeconds());
        }
    }

    async handleState({ action, data, error, address }: Result<ActionResult> & Context) {
        console.group(`\n\n🐒  Monkey Chaos Loop (${this.cycles})`)
        this.report.printProbabilities()
        this.report.log({ emoji: '🙊', message: `Monkey chose to ${action} validator ${address || ''}` });


        if (action === 'create') {
            await this.report.printBalance(this.donator.address, 'donator');
            await this.report.printBalance(address!, 'New validator');
        }

        await this.report.addEvent(action, address, data?.hash || '', error);

        if (error) {
            this.report.log({ emoji: '🙊', message: `Monkey failed to ${action} with error: ${error}` });
        }

        this.report.print();
        this.report.log({ emoji: '🙈', message: `Sleeping for ${this.timer} seconds...` });

        console.groupEnd()
    }

    async run(): Promise<Result<ActionResult> & Context> {
        const { action, validator, onSucess } = this.pool.getVictim();
        const address = validator?.validator_address
        switch (action) {
            case 'deactivate':
                const deactivateRes = await this.actions.sendTx('deactivate', validator)
                if (deactivateRes.data) {
                    onSucess();
                    return { data: { hash: deactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: deactivateRes.error, address }
            case 'reactivate':
                const reactivateRes = await this.actions.sendTx('reactivate', validator)
                if (reactivateRes.data) {
                    onSucess();
                    return { data: { hash: reactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: reactivateRes.error, address }
            case 'create':
                const createValidatorRes = await this.actions.createValidator()
                if (createValidatorRes.data) {
                    onSucess(createValidatorRes.data.validator);
                    return { data: { hash: createValidatorRes.data.hash }, address: createValidatorRes.data.validator.validator_address, action, error: undefined }
                }
                return { data: undefined, action, error: createValidatorRes.error, address }
            case 'delete':
                const deleteRes = await this.actions.removeValidator(validator)
                if (deleteRes.data) {
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

    async fillEventsWithTx() {
        const events = this.report.events;
        for (const address in events) {
            for (const event of events[address as Address]) {
                const res = await MonkeyChaos.client.transaction.getBy({ hash: event.hash });
                event.tx = res;
                if (res.error) {
                    event.sucess = '❌'
                    event.error = event.error ? `${event.error}. Error while fetching hash: ${res.error.message}}` : res.error.message
                }
            }
        }
    }

    // Check all transactions from the staking contract
    // async check(): Promise<Result<boolean>> {
    //     const trackedValidators = Object.keys(this.report.events) as Address[];

    //     const expect = new Map<Address, { action: string, data?: string }[]>();
    //     for (const [address, events] of Object.entries(this.report.events)) {
    //         expect.set(address as Address, events.map(({ action, tx }) => ({ action, data: tx?.data?.data })));
    //     }

    //     const c = MonkeyChaos.client;
    //     const reqStakingAddress = (await c.constant.params());
    //     if (reqStakingAddress.error) return { error: reqStakingAddress.error.message, data: undefined };

    //     const txs = await c.transaction.get({ address: reqStakingAddress.data.stakingContractAddress });
    //     if (txs.error) return { error: txs.error.message, data: undefined };

    //     const got = new Map<Address, { action: string, data?: string }[]>();
    //     for (const tx of txs.data.filter(({from}) => trackedValidators.includes(from))) {
    //         const actionStr = parseTxData(tx.data);
    //         let action: Action
    //         switch (actionStr) {
    //             case 'CreateValidator': action = 'create'; break;
    //     }

    //     return { error: undefined, data: true };
    // }
}