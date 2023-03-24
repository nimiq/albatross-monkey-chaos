import { Client } from "nimiq-rpc-client-ts";
import donator from "./data/donator";
import { unlockKey } from "./instances/account";
import { createValidator, deleteValidator, unlockGenesisValidators } from "./instances/validator";

export type Result<T> = {
    error: string,
    data: undefined
} | {
    error: undefined,
    data: T
}

const probabilities = {
    'toggle': 0.8,
    'create': 0.95,
    'remove': 1
}

async function main(){ 
    const client = new Client(new URL("http://localhost:10200"));
    // const {data: validator, error} = await unlockGenesisValidators(client);
    // if(error) throw new Error(error);
    await unlockKey(client, donator)

    const newV = await createValidator(client);
    if(!newV.data) throw new Error(newV.error);

    setTimeout(async () => {
        const res = await deleteValidator(client, newV.data);
        console.log('REsults!');
        console.log(res);
    }, 10000);
    
    // await monkeyChaos(client, validators, {probabilities, count: 10});
}

main()