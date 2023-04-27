import { generateBls } from "albatross-util-wasm";
import { DeleteValidatorTxParams, NewValidatorTxParams, RetireValidatorTxParams, Transaction } from "nimiq-rpc-client-ts";
import { resolve } from "path";
import { Action, ErrorMonkeyChaosExecution, MonkeyChaosEvent, MonkeyChaosExecution, OkMonkeyChaosExecution, Result, State, TransferParams } from "../types.d";
import { MonkeyChaos } from "./MonkeyChaos";
import { getTime } from "./utils";
import { Validator } from "./validator-state-machine/Validator";

export class Actions {
    monkeyChaos: MonkeyChaos;
    static eventCount: number = 1;

    constructor(monkeyChaos: MonkeyChaos) {
        this.monkeyChaos = monkeyChaos;
    }

    async getExecution(): Promise<MonkeyChaosExecution> {
        const { item, action, target, origin } = MonkeyChaos.selector.chooseMovement();

        if (!item && action !== Action.CREATE)
            throw new Error(`No validator keys provided for action ${action}`);

        let validator: Validator
        if (item) validator = item
        else {
            validator = new Validator()
            await validator.createValidator();
        }
        const execution: MonkeyChaosExecution = {
            action: action,
            states: [origin, target],
            validator,
            time: getTime(),
            index: Actions.eventCount++,
        };
        return execution;
    }

    async run(execution: MonkeyChaosExecution): Promise<MonkeyChaosEvent> {
        const event = (await this.runExecutions([execution]))[0];
        execution.validator.addEvent(event)
        return event;
    }

    async runExecutions(executions: MonkeyChaosExecution[]): Promise<MonkeyChaosEvent[]> {
        const transactionsPromises = executions.map(event => {
            switch (event.action) {
                case Action.CREATE: return this.create(event);
                case Action.DEACTIVATE: return this.deactivate(event);
                case Action.REACTIVATE: return this.reactivate(event);
                case Action.RETIRE: return this.retire(event);
                case Action.DELETE: return this.delete(event);
            }
        })
        const transactions = await Promise.all(transactionsPromises);

        function updateStateMachine(execution: MonkeyChaosExecution) {
            let result: Result<boolean>;
            if (execution.states[0] === undefined) {
                if ('error' in execution) {
                    MonkeyChaos.report.log({
                        type: 'error',
                        message: `There was an error while trying to ${execution.action}`,
                        details: [execution.error as string]
                    })
                    return
                };
                result = MonkeyChaos.selector.insertItem(execution.validator);
            } else {
                result = MonkeyChaos.selector.moveItem(execution.validator, execution.states[1]);
            }

            if (result.error) {
                MonkeyChaos.report.log({
                    type: 'error',
                    message: `Error moving item ${execution.validator.address} from ${execution.states[0]} to ${execution.states[1]}`,
                    details: [result.error!]
                })
            }
        }

        return transactions.map((tx, i) => {
            const execution = executions[i];
            updateStateMachine(execution);

            if (tx.error) {
                MonkeyChaos.report.log({
                    type: 'error',
                    message: `Couldn't fetch tx for ${execution.action} ${execution.validator.name}`,
                    details: [tx.error]
                })
                return { ...execution, error: tx.error } as ErrorMonkeyChaosExecution
            }
            return { ...execution, tx: tx.data } as OkMonkeyChaosExecution
        })
    }

    async create(initialExecution: MonkeyChaosExecution): Promise<Result<Transaction>> {
        const { validator } = initialExecution;
        const { address, signingKey } = validator;

        const importKey = await MonkeyChaos.client.account.importRawKey({ keyData: signingKey });
        if (importKey.error) return { error: importKey.error.message, data: undefined }

        const isImported = await MonkeyChaos.client.account.isImported({ address });
        if (isImported.error) return { error: isImported.error.message, data: undefined }

        const unlock = await MonkeyChaos.client.account.unlock({ address });
        if (unlock.error) return { error: unlock.error.message, data: undefined }

        const constants = await MonkeyChaos.client.constant.params();
        if (constants.error) return { error: constants.error.message, data: undefined }

        const transfer: TransferParams = {
            recipient: address,
            wallet: MonkeyChaos.donator.address,
            value: constants.data!.validatorDeposit,
        }

        const tx = await MonkeyChaos.client.transaction.sendSync({ ...transfer, fee: 0, relativeValidityStartHeight: 1 }, { timeoutConfirmation: 20 * 1e3 })
        if (tx.error) return { error: tx.error.message, data: undefined }

        MonkeyChaos.report.printTransfer(transfer)

        const params: NewValidatorTxParams = {
            fee: 0,
            relativeValidityStartHeight: 4,
            senderWallet: address,
            rewardAddress: address,
            validator: address,
            votingSecretKey: generateBls().secretKey,
            signingSecretKey: signingKey,
            signalData: '',
        }

        const albatrossPath = resolve(process.cwd(), 'config/albatross-config.toml')
        process.env.NIMIQ_OVERRIDE_DEVNET_CONFIG = albatrossPath

        await validator.startProcess()

        const newValidator = await MonkeyChaos.client.validator.action.new.sendSyncTx(params, { timeoutConfirmation: 80 * 1e3 })
        if (newValidator.error) return { error: newValidator.error.message, data: undefined }

        return {
            error: undefined,
            data: newValidator.data.tx
        }
    }

    async deactivate({ validator }: MonkeyChaosExecution): Promise<Result<Transaction>> {
        const params = {
            fee: 0,
            senderWallet: validator.address,
            signingSecretKey: validator.signingKey,
            validator: validator.address,
            relativeValidityStartHeight: 4
        }

        const req = await MonkeyChaos.client.validator.action.deactivate.sendSyncTx(params, { timeoutConfirmation: 80 * 1e3 });
        if (req.error) return { error: req.error.message, data: undefined }
        return { error: undefined, data: req.data.tx }
    }

    async reactivate({ validator }: MonkeyChaosExecution): Promise<Result<Transaction>> {
        const params = {
            fee: 0,
            senderWallet: validator.address,
            signingSecretKey: validator.signingKey,
            validator: validator.address,
            relativeValidityStartHeight: 4
        }
        const req = await MonkeyChaos.client.validator.action.reactivate.sendSyncTx(params, { timeoutConfirmation: 20 * 1e3 });
        if (req.error) return { error: req.error.message, data: undefined }
        return { error: undefined, data: req.data.tx }
    }

    async retire({ validator }: MonkeyChaosExecution): Promise<Result<Transaction>> {
        const params: RetireValidatorTxParams = {
            senderWallet: validator.address,
            validator: validator.address,
            relativeValidityStartHeight: 4,
            fee: 0,
        }
        const req = await MonkeyChaos.client.validator.action.retire.sendSyncTx(params, { timeoutConfirmation: 20 * 1e3 });
        if (req.error) return { error: req.error.message, data: undefined }

        return { error: undefined, data: req.data.tx }
    }

    async delete({ validator }: MonkeyChaosExecution): Promise<Result<Transaction>> {
        const params: DeleteValidatorTxParams = {
            fee: 0,
            relativeValidityStartHeight: 4,
            recipient: validator.address,
            validator: validator.address,
            value: 1_000_000_000,
        }
        const req = await MonkeyChaos.client.validator.action.delete.sendSyncTx(params);
        if (req.error) return { error: req.error.message, data: undefined }

        await validator.killProcess()

        return { error: undefined, data: req.data.tx }
    }

    async deleteBatch(validators: Validator[]): Promise<MonkeyChaosEvent[]> {
        const executions: MonkeyChaosExecution[] = validators.map(v => {
            return {
                action: Action.DELETE,
                states: [State.RETIRED, State.DELETED],
                validator: v,
                time: getTime(),
                index: Actions.eventCount++,
            };
        })
        const events = await this.runExecutions(executions);
        events.forEach(e => e.validator.addEvent(e))

        return events
    }
}