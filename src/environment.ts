import { Address, Client } from "nimiq-rpc-client-ts"
import { unlockKey } from "./artifacts/account"
import donator from "./keys/donator"
import validatorKeys from "./keys/validator-keys"
import { Result } from "./monkey-chaos"

export type InstanceKey = {address: Address, address_raw?: string, public_key?: string, private_key: string}
export type ValidatorKeys = { signing_key: InstanceKey, address: InstanceKey, reward_address: InstanceKey, active: boolean }

export async function unlockGenesisValidators(client: Client): Promise<Result<ValidatorKeys[]>> {
    const keys = validatorKeys as unknown as ValidatorKeys[]
    const promises = keys.map(async (v) => {
        await unlockKey(client, v.address)
        await unlockKey(client, v.signing_key)
        await unlockKey(client, v.reward_address)
    })
    await Promise.all(promises)

    const listReq = await client.account.list()
    if (listReq.error) return { error: listReq.error.message, data: undefined }
    const list = listReq.data!;

    console.log(`List of accounts: ${list.length}`)
    console.log(list)
    console.log('\n\n\n')

    return {
        error: undefined,
        data: keys.map((v) => ({...v, active: true}) as ValidatorKeys)
    }
}

export type PrepareEnvironmentOptions = {
    unlockValidators: boolean,
    unlockDonator: boolean,
}

export async function prepareEnvironment<T extends PrepareEnvironmentOptions>(client: Client, options: PrepareEnvironmentOptions) {
        let validators: ValidatorKeys[] | undefined = undefined
        let donatorInfo: ValidatorKeys | undefined = undefined
    
    if (options.unlockValidators) {
        const res = await unlockGenesisValidators(client)
        if (res.error) return { error: res.error, data: undefined }
        validators = res.data
    }

    if (options.unlockDonator) {
        const res = await unlockKey(client, donator)
        if (res.error) return { error: res.error, data: undefined }
    }

    return {
        error: undefined,
        // @ts-ignore
        data: {
            validators,
            donator
        }
    }
}