import { exec } from 'child_process';
import { Address, Client } from "nimiq-rpc-client-ts";
import path from 'path';
import { Result } from "../monkey-chaos";

export interface BlsKey {
    publicKey: string;
    privateKey: string;
    proofOfKnowledge: string;
}

export function getBlsKey(): Promise<Result<BlsKey>> {
    return new Promise((resolve) => {

        const currentDir = process.cwd();
        const cargoTomlPath = path.resolve(currentDir, '..', 'core-rs-albatross', 'Cargo.toml');
        const command = `RUSTFLAGS='-C codegen-units=1' cargo run --quiet --manifest-path ${cargoTomlPath} --bin nimiq-bls`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                resolve({ error: error.message, data: undefined });
            }

            if (stderr) {
                console.error(`Standard error: ${stderr}`);
                resolve({ error: stderr, data: undefined });
            }

            const outputLines = stdout.trim().split('\n').filter(Boolean);
            const blsKeys: BlsKey = {
                publicKey: outputLines[1].trim(),
                privateKey: outputLines[3].trim(),
                proofOfKnowledge: outputLines[5].trim(),
            };

            resolve({ error: undefined, data: blsKeys });

        });
    });
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