import { createWriteStream, writeFileSync, type WriteStream } from 'fs';
import { Address, PolicyConstants } from "nimiq-rpc-client-ts";
import { Writable } from "stream";
import { MonkeyChaosExecution, MonkeyChaosEvent, MonkeyChaosEventsDict, State, TransferParams } from "../types.d";
import { MonkeyChaos } from "./MonkeyChaos";
import { getTime } from './utils';
import { Edge } from './validator-state-machine/StateMachine';
import { Validator } from './validator-state-machine/Validator';

class TeeStream extends Writable {
    private fileStream: WriteStream;

    constructor(filePath: string) {
        super();
        this.fileStream = createWriteStream(filePath);
    }

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        process.stdout.write(chunk, encoding, (err) => {
            if (err) {
                callback(err);
                return;
            }

            this.fileStream.write(chunk, encoding, callback);
        });
    }

    _final(callback: (error?: Error | null) => void): void {
        this.fileStream.end(callback);
    }

    table(data: any, properties?: ReadonlyArray<string>): void {
        const originalConsoleLog = console.log;
        console.log = (...args: any[]) => {
            this.write(args.join(' ') + '\n');
        };

        console.table(data, properties);
        console.log = originalConsoleLog;
    }
}

const emoji = {
    'info': '🐒',
    'debug': '🙉',
    'trace': '🙈',
    'milestone': '🐵',
    'success': '✅',
    'error': '❌',
} as const;

type LogParams = {
    type?: keyof typeof emoji,
    message: string,
    time?: boolean | string,
    details?: string[]
    tabs?: number
}


function getEmoji(type?: keyof typeof emoji) {
    return type ? `${emoji[type]}  ` : '';
}

export class Report {
    monkeyChaos: MonkeyChaos;
    tee: TeeStream;

    constructor(monkeyChaos: MonkeyChaos) {
        this.monkeyChaos = monkeyChaos;
        const output = `${MonkeyChaos.output}/monkey-chaos.log`;
        this.tee = new TeeStream(output);
    }

    log(params: LogParams | string) {
        if (typeof params === 'string') {
            this.tee.write(`${params}\n`);
            return;
        }

        const { type, message, time, details, tabs } = params
        const tabsStr = tabs ? '\t'.repeat(tabs) : '';
        const withTime = time !== false;
        const pre = (withTime ? `[${typeof time === 'string' ? time : getTime()}] ` : '') + tabsStr + (type ? getEmoji(type) : '');
        this.tee.write(`${pre}${message}\n`);

        for (const detail of details || []) {
            if (detail.trim() === '') continue;
            this.tee.write(tabsStr + `\t➡️  ${detail}\n`);
        }
    }

    async printInitialState(policy: PolicyConstants) {
        this.log({ type: 'info', message: 'Starting Monkey Chaos...' })

        this.log({ type: 'debug', message: 'The current policy is:', time: false })
        this.tee.table(policy)

        const timer = this.monkeyChaos.timer
        const timerStr = typeof timer === 'number' ? timer : timer.join('-')

        this.log({ type: 'debug', message: `It will run ${this.monkeyChaos.cycles} in intervals of ${timerStr}s times` })

        this.log({ type: 'debug', message: 'The current state machine goes as follows:' })
        this.printItemsWithDetails()
    }

    printReport(validator: Validator[]) {
        this.log('📝  Report')
        this.printItemsWithDetails()

        validator.forEach(validator => {
            this.log(`🎉  Events ${validator.name} ${validator.address}`)
            validator.events.forEach((e) => {
                const detail = e.error ? e.error : e.tx!.hash
                this.log({ type: 'info', message: `- ${e.action} (${e.states[0]} -> ${e.states[1]}). (${e.index})`, time: e.time, details: [detail], tabs: 1 })
            })
        })
    }

    async printInitialEvent(event: MonkeyChaosExecution) {
        const { action, validator, index } = event
        const { address } = validator;

        this.log({ type: 'info', message: `Monkey chose to ${action} ${validator.name} ${address}` });
    }

    async printEvent(event: MonkeyChaosEvent) {
        const { action, error, validator, states, tx } = event
        this.log({ type: error ? 'error' : 'success', message: `Monkey chose to ${action}(${states[0]}->${states[1]}) ${validator.name} ${validator.address}`, details: error ? [error] : [tx!.hash] });
        this.printItemsWithDetails();
    }

    async saveEvents() {
        const validators = Array.from(MonkeyChaos.selector.nodes.values()).map(node => node.items).flat()

        const events = new Map<Address, MonkeyChaosEvent[]>;
        for (const v of validators) events.set(v.address, v.events)

        writeFileSync(`${MonkeyChaos.output}/monkey-chaos-events.json`, JSON.stringify(events, null, 2))
    }

    printItemsWithDetails(): void {
        const table = MonkeyChaos.selector.printItemsWithDetails((v: Validator) => `${v.name} | ${v.address}`)
        this.tee.table(table);
    }

    async printTransfer({ wallet, recipient, value }: TransferParams) {
        const senderAccount = await MonkeyChaos.client.account.getBy({ address: wallet });
        const recipientAccount = await MonkeyChaos.client.account.getBy({ address: recipient });

        const message = `Transfer ${value} from ${wallet} to ${recipient}`;

        if (senderAccount.error || recipientAccount.error) {
            const details = [senderAccount.error?.message || recipientAccount.error?.message].filter(Boolean) as string[]
            this.log({ type: 'error', message, details })
        }
        const senderBalance = senderAccount.data!.balance;
        const recipientBalance = recipientAccount.data!.balance;

        this.log({ type: 'debug', message, details: [`Sender: ${senderBalance} | Recipient: ${recipientBalance}`], tabs: 1 })
    }
}