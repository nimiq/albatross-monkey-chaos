import { parseTxData } from "albatross-util-wasm";
import { Address, Client, Transaction } from "nimiq-rpc-client-ts";
import { MonkeyChaos } from "./monkey-chaos/MonkeyChaos";

enum TxEvent {
    CreateValidator = "CreateValidator",
    DeactivateValidator = "DeactivateValidator",
    ReactivateValidator = "ReactivateValidator",
    RetireValidator = "RetireValidator",
    DeleteValidator = "DeleteValidator"
}

const events = Object.values(TxEvent)

async function* eventTransactionGen(client: Client, stakingContract: Address) {
    const max = Math.pow(2, 16) - 1
    const result = await client.transaction.getBy({ address: stakingContract, max });
    if (result.error) throw new Error(`Unable to fetch data ${result.error!.message}`);
    console.log(`Fetched ${result.data!.length} transactions`);

    const withData = result.data!.filter(tx => tx.data).length
    console.log(`Found ${withData} transactions with data`);

    for (const tx of result.data!) {
        if (!tx.data) continue
        try {
            const parsedData = parseTxData(tx.data);
            const type = Object.keys(parsedData)[0] as TxEvent; // Get the key from the JSON object
            console.log(type)
            if (events.includes(type)) {
                console.log(`New event: ${type} for ${tx.from} || ${tx.to}`);
                yield {
                    type,
                    tx
                };
            }
        }
        catch (e) { }
    }
}

export class EventsFetcher {
    events: Map<Address, { tx: Transaction, type: TxEvent }[]>;

    constructor() {
        this.events = new Map();
    }

    async fillEvents() {
        const gen = eventTransactionGen(MonkeyChaos.client, MonkeyChaos.stakingContract)
        let next: IteratorResult<{ tx: Transaction, type: TxEvent }, void>;
        while (!(next = await gen.next()).done) {
            const { tx, type } = next.value;

            const validator = tx.to === MonkeyChaos.stakingContract ? tx.from : tx.to

            if (!this.events.has(validator)) {
                this.events.set(validator, [])
            }

            this.events.get(validator)!.push({ tx, type })
        }
    }
}