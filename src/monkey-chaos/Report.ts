import { createWriteStream, writeFileSync, type WriteStream } from 'fs';
import { Address } from "nimiq-rpc-client-ts";
import { Writable } from "stream";
import { Action } from "../types";
import { MonkeyChaos } from "./MonkeyChaos";
import { Transaction } from 'nimiq-rpc-client-ts';
import { MaybeCallResponse } from 'nimiq-rpc-client-ts';

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

    table(data: any): void {
        const originalConsoleLog = console.log;
        console.log = (...args: any[]) => {
            this.write(args.join(' ') + '\n');
        };

        console.table(data);
        console.log = originalConsoleLog;
    }
}

export type MonkeyChaosEvent = {
    action: Action,
    address?: Address,
    network: string,
    time: string,
    sucess: '✅' | '❌'
    error?: string,
    hash: string
    tx?: MaybeCallResponse<Transaction>
}[]

type LogParams = {
    emoji?: string,
    message: string,
    error?: string,
    time?: boolean | string,
}

export class Report {
    monkeyChaos: MonkeyChaos;
    events: Record<Address, MonkeyChaosEvent> = {};
    tee: TeeStream;

    constructor(monkeyChaos: MonkeyChaos) {
        this.monkeyChaos = monkeyChaos;
        const output = `${monkeyChaos.output}/monkey-chaos.log`;
        this.tee = new TeeStream(output);
    }

    async getNetworkInfo() {
        const block = (await MonkeyChaos.client.block.current()).data!;
        const batch = (await MonkeyChaos.client.batch.current()).data!;
        const epoch = (await MonkeyChaos.client.epoch.current()).data!;
        return `${block}/${batch}/${epoch}`
    }

    async addEvent(action: Action, address: Address = 'NQ00 Creator', hash?: string, error?: string) {
        if (!this.events[address]) this.events[address] = [];
        this.events[address].push({
            sucess: error ? '❌' : '✅',
            action,
            address,
            network: await this.getNetworkInfo(),
            time: this.getTime(),
            error,
            hash: hash || ''
        })
    }

    getTime(timestamp = new Date()) {
        const ms = `00${timestamp.getMilliseconds()}`.slice(-3);
        return `${timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, ':')}:${ms}`
    }

    log({emoji, message, error, time}: LogParams) {
        const withTime = time !== false;
        const pre = (withTime ? `[${typeof time === 'string' ? time : this.getTime()}] ` : '') + (emoji ? `${emoji}  ` : '');
        this.tee.write(`${pre}${message}\n`);
        if (error) {
            this.tee.write(`\t❌ ${error} ❌\n`)
        }
        return time;
    }

    print() {
        const active = Array.from(this.monkeyChaos.pool.active).map(({ validator_address: validator }) => ({ validator, status: 'active' }));
        const requestedToDeactivate = Array.from(this.monkeyChaos.pool.requestedDeactivate).map(({ validator_address: validator }) => ({ validator, status: 'requestedToBeDeactivated' }));
        const deactivate = Array.from(this.monkeyChaos.pool.deactivate).map(({ validator_address: validator }) => ({ validator, status: 'deactivated' }));
        const deleted = Array.from(this.monkeyChaos.pool.deleted).map(({ validator_address: validator }) => ({ validator, status: 'deleted' }));
        const allValidators = active.concat(requestedToDeactivate).concat(deactivate).concat(deleted);
        this.tee.table(allValidators);
    }

    printProbabilities() {
        const probabilities = this.monkeyChaos.pool.getProbabilities()
        const percentages = probabilities
            .map(({ action, range }) => ({ action, sum: range[1] - range[0] }))
            .map(({ action, sum }) => ({ action, percentage: ((sum / probabilities.at(-1)!.range[1]) * 100).toFixed(3) + '%' }))
        this.tee.table(percentages);
    }

    async printCurrentActiveValidators() {
        const activeSet = await MonkeyChaos.client.validator.activeList();
        if (activeSet.error) return { error: activeSet.error.message, data: undefined }
        const validators = activeSet.data!.map(v => v.address).join(', ');
        this.log({ emoji: '🙈', message: 'Current active validators:' })
        this.tee.table(validators)
    }

    async printInitialState() {
        this.log({emoji: '🐒', message: 'Starting Monkey Chaos...'})

        const policy = await MonkeyChaos.client.constant.params();
        if (policy.error) throw new Error(policy.error.message);
        this.log({emoji: '🐵', message: 'The current policy is:', time: false})
        this.tee.table(policy.data)

        const timer = this.monkeyChaos.timer
        const timerStr = typeof timer === 'number' ? timer : timer.join('-')

        this.log({emoji: '🐵', message: `It will run ${this.monkeyChaos.cycles} in intervals of ${timerStr}s times`})

        this.log({emoji: '🐵', message: 'The state of the validators is:'})
        this.print()
    }

    printReport() {
        this.log({emoji: '📝', message: `Report`, time: false})
        for (const address in this.events) {
            this.log({message: `${address}:`, time: false})
            for (const event of this.events[address as Address] || []) {
                this.log({ message: `\t\t${event.action} ${event.sucess} ${event.network}`, time: event.time })
                if(event.error) {
                    this.log({ message: `\t\t${event.error}`, time: false})
                }
                this.log({ message: `\t\t${event.hash}`, time: false})
                this.log({ message: '-----------------------------', time: false})
            }
        }
        
        const table = Object.entries(this.events).map(([address, events]) => ({ address, events: events.length }))
        this.tee.table(table)
    }

    async printBalance(address: Address, alias?: string) {
        const result = await MonkeyChaos.client.account.getBy({ address });
        if (result.error) this.log({ emoji: '❌', message: 'Error getting ${address}(${alias}) funds', error: result.error.message})
        this.log({ emoji: '💰', message: `${address}(${alias}) has ${result.data!.balance / 1e-5} NIM` })
    }

    async saveEvents() {
        MonkeyChaos.client.transaction.getBy({hash: ''})
        await Promise.all(Object.values(this.events)
            .flat()
            .map(async (event) => event.tx = await MonkeyChaos.client.transaction.getBy({ hash: event.hash })))
        writeFileSync(`${this.monkeyChaos.output}/monkey-chaos-events.json`, JSON.stringify(this.events, null, 2))
    }
}