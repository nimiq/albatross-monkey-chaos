import { Client } from "nimiq-rpc-client-ts";
import { createValidator, sendTx, ValidatorKeys } from "./instances/validator";

let client: Client

async function toggleValidator(validators: ValidatorKeys[]) {
    const index = Math.floor(Math.random() * validators.length);
    const randomValidator = validators[index];
    const action = randomValidator.active ? 'inactived' : 'reactived'
    console.log(`🐒  Monkey Chaos is making ${randomValidator.address.address} ${action}`)
    const {address, private_key} = randomValidator.signing_key
    const txReq = await sendTx(client, action, {address, private_key})
    if (!txReq || txReq.error) {
        console.log(`❌  Something went wrong: ${txReq?.error.message}`)
    }
    console.log(`✅  Success`)

    validators[index].active = !validators[index].active;
}

async function monkeyChaosInterval(validators: ValidatorKeys[], {count, probabilities}: MonkeyChaosConfig) {
    if (count === 0) return;

    console.log(`🐒  Starting Monkey Chaos...`)

    const random = Math.random();
    if(random < probabilities.toggle) {
        toggleValidator(validators);
    } else if(random < probabilities.create) {
        console.log(`🐒  Monkey chose to create validator...`)
        const address = await createValidator(client);
        console.log(`🐒  New validator created: ${address}`)
    } else if(random < probabilities.remove) {
        console.log(`🐒  Monkey chose to remove validator...`)
        console.log(`SKIPPED`)
    }

    count -= 1;

    const randomTime = Math.floor(Math.random() * 55) + 5;
    console.log(`🐒  Sleeping for ${randomTime} seconds...`)
    setTimeout(() => monkeyChaosInterval(validators, {probabilities, count: count}), randomTime * 1000);
}

type MonkeyChaosConfig = {
    probabilities: Record<string, number>,
    count: number
}

export async function monkeyChaos(client_: Client, validators: ValidatorKeys[], config: MonkeyChaosConfig) {
    client = client_;
    monkeyChaosInterval(validators, config);
}
