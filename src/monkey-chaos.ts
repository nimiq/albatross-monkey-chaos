import { Client } from "nimiq-rpc-client-ts";
import { createValidator, removeValidator, sendTx } from "./artifacts/validator";
import { ValidatorKeys } from "./environment";

export type Result<T> = {
    error: string,
    data: undefined
} | {
    error: undefined,
    data: T
}

let client: Client

const actions = ['deactivate', 'reactivate', 'create', 'delete'] as const;
type Action = typeof actions[number];
export type Probabilities = Record<Action, number>;
export type MonkeyChaosConfig = {
    probabilities: Probabilities,
    count: number
    timer: number | [number, number]
}

type MonkeyChaosReport = {
    action: Action,
    validator: string,
    block: number,
    time: string,
    sucess: '✅' | '❌'
    error?: string
}[]

type RouletteDecision = {
    action: Action,
    validator: ValidatorKeys
} | {
    action: 'create',
    validator: undefined
}

function playRoulette(validators: ValidatorKeys[], probabilities: Probabilities): RouletteDecision {
    const action = actions[Math.floor(Math.random() * actions.length)];
    if (action === 'create') return { action, validator: undefined }
    
    const validator = validators[Math.floor(Math.random() * validators.length)];

    // This is not perfect, as the monkey chaos could choose to deactivate a validator that is already deactivated.
    // or vice versa. But it's something that can happen in real life, so it's fine.
    return { action, validator }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function monkeyChaosLoop(validators: ValidatorKeys[], {count, probabilities, timer}: MonkeyChaosConfig, report: MonkeyChaosReport) {
    while (count > 0) {
        count--;

        const {action, validator} = playRoulette(validators, probabilities);

        console.log(`🙊  Monkey chose to ${action} validator ${validator?.address.address || ''} (${count})`)

        let req: Awaited<ReturnType<typeof sendTx> | ReturnType<typeof createValidator> | ReturnType<typeof removeValidator>> | undefined;

        switch (action) {
            case 'deactivate':
                req = await sendTx(client, 'deactivate', validator.signing_key)
                break;
            case 'reactivate':
                req = await sendTx(client, 'reactivate', validator.signing_key)
                break;
            case 'create':
                req = await createValidator(client);
                if (req.data) {
                    validators.push(req.data)
                }
                break;
            case 'delete':
                req = await removeValidator(client, validator.address);
                validators = validators.filter(v => v.address.address !== validator.address.address)
                break;
        }

        const timestamp = new Date();
        const ms = `00${timestamp.getMilliseconds()}`.slice(-3);
        const time =
            `${timestamp.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace(/:/g, ':')}:${ms}`

        const block = await client.block.current();
        if (block.error) throw new Error(block.error.message);

        report.push({
            sucess: req && req.error ? '❌' : '✅',
            action,
            validator: validator?.address.address || validators.at(-1)?.address.address || '',
            block: block.data,
            time,
            error: req.error || '',
        })
            
        if (req && req.error) {
            console.log(`\t❌  Something went wrong: ${req?.error}`)
            console.log(req)
        } else {
            console.log(`\t✅  Success`)
        }
        
        req = undefined;

        let randomTime: number;
        if (typeof timer === 'number') randomTime = timer;
        else randomTime = Math.floor(Math.random() * (timer[1] - timer[0])) + timer[0];
        console.log(`🙈  Sleeping for ${randomTime} seconds...`)

        await sleep(randomTime * 1000);
    }
}

function pre(client_: Client, validators: ValidatorKeys[], config: MonkeyChaosConfig) {
    const sum = Object.values(config.probabilities).reduce((acc, val) => acc + val, 0);
    if (sum !== 1000) throw new Error(`Use integers between 0-1000. Probabilities must sum up to 1000. Current sum ${sum}}`);
    
    if (typeof config.timer === 'number' && config.timer < 0) throw new Error('Timer must be positive');
    if (Array.isArray(config.timer) && config.timer[0] < 0) throw new Error('Timer must be positive');
    if (Array.isArray(config.timer) && config.timer[0] > config.timer[1]) throw new Error('Second timer value must be greater than first');
    
    client = client_;
    
    const accumulativeProbabilities = Object.entries(config.probabilities).reduce((acc, [key, value], i) =>
        ({ ...acc, [key as Action]: i === 0 ? value : acc[Object.keys(acc)[i - 1] as Action] + value }), {} as Probabilities);

    const report: MonkeyChaosReport = []
    return {accumulativeProbabilities, report}
}

function preLog(validators: ValidatorKeys[], config: MonkeyChaosConfig){
    console.log(`🐒  Starting Monkey Chaos...`)
    console.log(`🐵  It will run ${config.count} in intervals of ${config.timer}s times with the following probabilities:`)
    const table = Object.entries(config.probabilities).map(([action, probability]) => {
        return {
            action,
            probability: `${(probability / 10).toFixed(2)}%`,
        }
    })
    console.table(table)
    
    console.log(`🐵  With the validators from the Genesis Block:`)
    console.table(validators.map(({address, active}) => ({ address: address.address, active })))
}

function postLog(report: MonkeyChaosReport){
    console.log(`🐒  Monkey Chaos finished...`)
    console.log(`📝  Report:`)
    console.table(report)
}

export async function monkeyChaos(client_: Client, validators: ValidatorKeys[], config: MonkeyChaosConfig) {
    const { accumulativeProbabilities, report } = pre(client_, validators, config);
    preLog(validators, config);

    await monkeyChaosLoop(validators, {...config, probabilities: accumulativeProbabilities}, report);

    postLog(report);
}
