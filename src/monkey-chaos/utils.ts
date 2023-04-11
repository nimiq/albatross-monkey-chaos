import fs from 'fs';
import { Address, Client } from "nimiq-rpc-client-ts";
import { Result, Wallet } from "../types";
import { resolve } from 'path';

export async function getBlockNumber(client: Client) {
    const block = await client.block.current();
    if (block.error) throw new Error(block.error.message);
    return block.data;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getNetworkInfo(client: Client) {
    const block = (await client.block.current()).data!;
    const batch = (await client.batch.current()).data!;
    const epoch = (await client.epoch.current()).data!;
    return `${block}/${batch}/${epoch}`
}

export interface BlsKey {
    publicKey: string;
    privateKey: string;
}

export async function unlockKey(client: Client, {private_key, address}: Wallet) {
    const importKey = await client.account.importRawKey({keyData: private_key}, {timeout: 100_000});
    if (importKey.error) return { error: importKey.error.message, data: undefined }

    const isImportedKey = await client.account.isImported({address});
    if (isImportedKey.error) return { error: isImportedKey.error.message, data: undefined }

    const unlocked = await client.account.unlock({address}, {timeout: 100_000});
    if (unlocked.error) return { error: unlocked.error.message, data: undefined }
    return { error: undefined, result: true }
}

export async function moveFunds(client: Client, sender: Address, recipient: Address, value: number) {
    const tx = await client.transaction.send({
        fee: 0,
        recipient,
        relativeValidityStartHeight: 1,
        value,
        wallet: sender
    })
    return tx;
}

export function createOuputFolder(path: string): Result<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hour = `0${date.getHours()}`.slice(-2);
    const minute = `0${date.getMinutes()}`.slice(-2);
    const second = `0${date.getSeconds()}`.slice(-2);
    const folder = `${year}${month}${day}_${hour}${minute}${second}`;
    const folderPath = resolve(process.cwd(), path, folder);
    return createFolder(folderPath);
}

export function createFolder(path: string): Result<string> {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }

    return {
        error: undefined,
        data: resolve(path)
    }
}
