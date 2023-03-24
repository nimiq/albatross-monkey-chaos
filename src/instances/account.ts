import { Address, Client } from "nimiq-rpc-client-ts";
import Bbls from "../data/bls-keys"
import { InstanceKey } from "./validator";

type BlsKey = {public_key: string, private_key: string}

export async function getBlsKey(): Promise<BlsKey> {
    return Bbls.shift() as BlsKey;
}

export async function unlockKey(client: Client, {private_key, address}: {private_key: string, address: Address}) {
    const importKey = await client.account.importRawKey({keyData: private_key}, {timeout: 100_000});
    if (importKey.error) return { error: importKey.error.message, data: undefined }
    const unlocked = await client.account.unlock({address: address}, {timeout: 100_000});
    if (unlocked.error) return { error: unlocked.error.message, data: undefined }
    return { error: undefined, result: true }
}

export async function moveFunds(client: Client, sender: Address, recipient: Address, value: number) {
    const tx = await client.transaction.send({
        fee: 1000,
        recipient,
        relativeValidityStartHeight: 5,
        value,
        wallet: sender
    })
    return tx;

}