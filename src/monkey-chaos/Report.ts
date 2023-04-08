import { Action } from "../types";
import { MonkeyChaos } from "./MonkeyChaos";

export type MonkeyChaosEvent = {
    action: Action,
    address?: string,
    network: string,
    time: string,
    sucess: '✅' | '❌'
    error?: string,
    hash: string
}[]

export class Report {
    monkeyChaos: MonkeyChaos;
    events: MonkeyChaosEvent = [];

    constructor(monkeyChaos: MonkeyChaos) {
        this.monkeyChaos = monkeyChaos;
    }

    async getNetworkInfo() {
        const block = (await MonkeyChaos.client.block.current()).data!;
        const batch = (await MonkeyChaos.client.batch.current()).data!;
        const epoch = (await MonkeyChaos.client.epoch.current()).data!;
        return `${block}/${batch}/${epoch}`
    }

    async addEvent(action: Action, address?: string, error?: string, hash?: string) {
        this.events.push({
            sucess: error ? '❌' : '✅',
            action,
            address,
            network: await this.getNetworkInfo(),
            time: this.getTime(),
            error,
            hash: hash || ''
        })
    }

    getTime() {
        const timestamp = new Date();
        const ms = `00${timestamp.getMilliseconds()}`.slice(-3);
        return `${timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, ':')}:${ms}`
    }

    log(emoji: string, message: string, error?: string) {
        const time = this.getTime();
        console.log(`[${time}] ${emoji}  ${message}`);
        if (error) {
            console.log(`\t❌ ${error} ❌`)
        }
        return time;
    }

    print() {
        const active = Array.from(this.monkeyChaos.pool.active).map(({validator_address: validator}) => ({ validator, status: 'active' }));
        const deactivate = Array.from(this.monkeyChaos.pool.deactivate).map(({validator_address: validator}) => ({ validator, status: 'active' }));
        const deleted = Array.from(this.monkeyChaos.pool.deleted).map(({validator_address: validator}) => ({ validator, status: 'active' }));
        const allValidators = active.concat(deactivate).concat(deleted);
        console.table(allValidators);
    }

    printProbabilities() {
        const probabilities = this.monkeyChaos.pool.getProbabilities()
        const percentages = probabilities
            .map(({ action, range }) => ({ action, sum: range[1] - range[0] }))
            .map(({ action, sum }) => ({ action, percentage: ((sum / probabilities.at(-1)!.range[1]) * 100).toFixed(3) + '%' }))
        console.table(percentages);
    }
}