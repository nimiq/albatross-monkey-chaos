import { Client } from "nimiq-rpc-client-ts";
import { prepareEnvironment } from "./environment";
import { monkeyChaos, Probabilities } from "./monkey-chaos";

const probabilities: Probabilities = {
    'deactivate': 450,
    'reactivate': 450,
    'create': 50,
    'delete': 50
}

async function main(){ 
    const client = new Client(new URL("http://localhost:10200"));
    const { data, error } = await prepareEnvironment(client, {unlockValidators: true, unlockDonator: true});
    if (error) throw new Error(error);
    
    await monkeyChaos(client, data?.validators!, {probabilities, count: 60, timer: 2});
}

main()