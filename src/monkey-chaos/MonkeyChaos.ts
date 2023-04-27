import { Client, PartialMacroBlock, PolicyConstants } from "nimiq-rpc-client-ts";
import { resolve } from "path";
import { Config } from "../config";
import { State } from "../types.d";
import { Actions } from "./Actions";
import { Report } from "./Report";
import { createOuputFolder, getRandomSeconds, sleep } from "./utils";
import { getSelector } from "./validator-state-machine";
import { Selector } from "./validator-state-machine/Selector";
import { Validator } from "./validator-state-machine/Validator";

export class MonkeyChaos {
    static client: Client;
    static output: string;
    static selector: Selector<Validator>;
    static actions: Actions;
    static report: Report;
    static monkeyChaosConfig: Config["monkeyChaosConfig"];
    static albatrossConfig: Config["albatrossConfig"];
    static policyConstants: PolicyConstants;
    postCycle: Function[] = [];

    constructor(client: Client, { albatrossConfig, monkeyChaosConfig }: Config) {
        const { scenario } = monkeyChaosConfig;
        MonkeyChaos.client = client;
        MonkeyChaos.selector = getSelector(Object.values(scenario.weights));
        MonkeyChaos.actions = new Actions(this);
        MonkeyChaos.output = createOuputFolder(monkeyChaosConfig.validator.output_logs).data!;
        MonkeyChaos.report = new Report(this);
        MonkeyChaos.monkeyChaosConfig = monkeyChaosConfig;
        MonkeyChaos.albatrossConfig = albatrossConfig;
    }

    async init() {
        const policy = await MonkeyChaos.client.constant.params();
        if (policy.error) throw new Error(`Error getting policy constants: ${policy.error.message}`);

        MonkeyChaos.policyConstants = policy.data!;
        await MonkeyChaos.report.printInitialState(MonkeyChaos.policyConstants);

        const closeAsyncDeactivated = await this.asyncDeactivate();
        const closeAsyncDelete = await this.asyncDelete();

        await this.loop();

        MonkeyChaos.selector.getAllItems().forEach(v => v.killProcess())

        closeAsyncDeactivated();
        closeAsyncDelete();

        MonkeyChaos.report.printReport(MonkeyChaos.selector.getAllItems());
        MonkeyChaos.report.saveEvents();

        MonkeyChaos.report.log({ type: 'info', message: 'Monkey Chaos finished...' });
    }

    static get donator() {
        return this.albatrossConfig.donator;
    }

    get cycles() {
        return MonkeyChaos.monkeyChaosConfig.scenario.cycles;
    }

    set cycles(cycles: number) {
        MonkeyChaos.monkeyChaosConfig.scenario.cycles = cycles;
    }

    get genesisValidators() {
        return MonkeyChaos.albatrossConfig.validators;
    }

    get timer() {
        return MonkeyChaos.monkeyChaosConfig.scenario.timer;
    }

    get weights() {
        return MonkeyChaos.monkeyChaosConfig.scenario.weights;
    }

    static get binPath() {
        const relativePath = MonkeyChaos.monkeyChaosConfig.validator.node_binary_path;
        return resolve(process.cwd(), relativePath);
    }

    static get stakingContract() {
        return MonkeyChaos.policyConstants.stakingContractAddress;
    }

    async loop() {
        while (this.cycles > 0) {
            this.cycles--;

            const initialEvent = await MonkeyChaos.actions.getExecution();
            MonkeyChaos.report.printInitialEvent(initialEvent);

            const event = await MonkeyChaos.actions.run(initialEvent)
            MonkeyChaos.report.printEvent(event);

            this.postCycle.forEach(f => f());
            this.postCycle = [];

            if (this.cycles > 0) {
                const sleepTime = getRandomSeconds(this.timer);
                MonkeyChaos.report.log({ type: 'info', message: `Sleeping for ${sleepTime / 1000} seconds...` });
                await sleep(sleepTime);
            }
        }
    }

    /**
     * Deactivated validators change its status once the epoch reach to an end, which is when an election block is reached.
     * Then, it is when the validator is actually deactivated.
     */
    private async asyncDeactivate() {
        const { next, close } = await MonkeyChaos.client.block.subscribe({ retrieve: 'PARTIAL', blockType: 'ELECTION' });

        next((block) => {
            if (block.error) return MonkeyChaos.report.log({ type: 'error', message: `Error while subscribing to election blocks`, details: [block.error.message] })

            const blockStr = `${block.data.epoch}/${block.data.batch}/${block.data.number}`;
            MonkeyChaos.report.log({
                type: 'milestone',
                message: `Election block (${blockStr})`
            });

            function performDeactivation() {
                const node = MonkeyChaos.selector.nodes.get(State.WAITING_DEACTIVATION)!;
                MonkeyChaos.report.log({
                    type: 'milestone',
                    message: `Deactiving ${node.items.length} validators`,
                    details: [node.items.map(v => v.address).join(', ')]
                });

                node.items.forEach(v => {
                    const result = MonkeyChaos.selector.moveItem(v, State.DEACTIVATED)
                    if (result.error) {
                        MonkeyChaos.report.log({
                            type: 'error',
                            message: `Error while moving validator from ${v.address} to ${State.DEACTIVATED}`,
                            details: [result.error]
                        });
                    }
                });
            }

            this.postCycle.push(performDeactivation);
        });

        return close;
    }

    /**
     * To delete validators, we need to wait until the first macro block of an epoch
     */
    private async asyncDelete() {
        const { next, close } = await MonkeyChaos.client.block.subscribe({ retrieve: 'PARTIAL', blockType: 'MACRO' });

        const { blocksPerBatch, blocksPerEpoch, batchesPerEpoch } = MonkeyChaos.policyConstants
        function isFirstMacroBlockOfEpoch({ epoch, number: block }: PartialMacroBlock) {
            return block === (epoch * blocksPerEpoch) - (batchesPerEpoch - 1) * blocksPerBatch;
        }

        next(async (block) => {
            if (block.error) return MonkeyChaos.report.log({ type: 'error', message: `Error while subscribing to election blocks`, details: [block.error.message] })
            if (!isFirstMacroBlockOfEpoch(block.data!)) return;

            const blockStr = `${block.data.epoch}/${block.data.batch}/${block.data.number}`;
            MonkeyChaos.report.log({
                type: 'milestone',
                message: `First MacroBlock (${blockStr})`,
            });

            function performDeactivation() {
                const node = MonkeyChaos.selector.nodes.get(State.RETIRED)!;
                MonkeyChaos.report.log({
                    type: 'milestone',
                    message: `Deleting ${node.items.length} validators`,
                    details: [node.items.map(v => v.address).join(', ')]
                });

                node.items.forEach(v => {
                    const node = MonkeyChaos.selector.getNodeByItem(v);
                    if (node.data?.node.state !== State.DELETED) {
                        MonkeyChaos.report.log({
                            type: 'error',
                            message: `Error while deleting validator ${v.address}`,
                            details: [`The error in the last event: ${v.events.at(-1)?.error}`]
                        });
                    }
                });
            }

            this.postCycle.push(performDeactivation);
        });

        return close;
    }
}