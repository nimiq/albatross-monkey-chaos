import { Client } from "nimiq-rpc-client-ts"
import { unlockKey } from "./monkey-chaos/utils"
import { AlbatrossConfig, ValidatorKeys } from "./types"

export async function unlockGenesisValidators(client: Client, validators: ValidatorKeys[]) {
    // TODO Get the correct private key for the validator
    const result = await Promise.all(validators.map(async (v) => await unlockKey(client, {address: v.validator_address, private_key: v.signing_key})))
    if(result.find(r => r.error)) return { error: result.find(r => r.error)!.error, data: undefined }

    const listReq = await client.account.list()
    if (listReq.error) return { error: listReq.error.message, data: undefined }
    const list = listReq.data!;

    // TODO Move somewhere else
    console.log(`List of accounts: ${list.length}`)
    console.log(list)
    console.log('\n\n\n')

    return {
        error: undefined,
        data: validators
    }
}

export async function prepareEnvironment(client: Client, {validators, donator}: AlbatrossConfig) {
    // const res1 = await unlockGenesisValidators(client, validators)
    // if (res1.error) return { error: res1.error, data: undefined }

    const res2 = await unlockKey(client, donator)
    if (res2.error) return { error: res2.error, data: undefined }

    return {
        error: undefined,
        data: true
    }
}