import { Client } from "nimiq-rpc-client-ts";
import { prepareEnvironment } from "./environment";
import { monkeyChaos } from "./monkey-chaos";
import config from "./config";

async function main(){ 
    const client = new Client(new URL("http://localhost:10200"));
    const { data, error } = await prepareEnvironment(client, {unlockValidators: true, unlockDonator: true});
    if (error) throw new Error(error);
    
    await monkeyChaos(client, data?.validators!, config);
}

main()