import { Address, BlockLog, Client, Transaction } from "nimiq-rpc-client-ts"

export type Callback = {
    error: { code: number, message: string },
    data: undefined
} | {
    error: undefined,
    data: BlockLog,
}

export async function handleLog(client: Client, address: Address, fn: (tx: Transaction) => {}) {
    const { next } = await client.logs.subscribe({addresses: [address]}, {once: true});
    next(async ({data, error}) => {
        if(error) {
            console.log({ error, data: undefined })
            return
        }
        if(data.transactions.length === 0) {
            console.log({ error: 'No transactions', data: undefined })
        }

        const txData = (await client.transaction.get({ hash: data.transactions[0].hash }));
        
        if(txData.error) {
            console.error(txData)
            throw new Error(txData.error.message)
        }

        fn(txData.data)
    })
}
