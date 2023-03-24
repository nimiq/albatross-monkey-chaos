import { Address, Client, DeleteValidatorTxParams, Transaction, ValidatorTxParams } from "nimiq-rpc-client-ts";
import donator from "../data/donator";
import Validators from "../data/validator-keys";
import { Result } from "../main";
import { getBlsKey, moveFunds, unlockKey } from "./account";
import { handleLog } from "./transactions";

export type InstanceKey = {address: Address, address_raw?: string, public_key?: string, private_key: string}
export type ValidatorKeys = { signing_key: InstanceKey, address: InstanceKey, reward_address: InstanceKey, active: boolean }

export async function unlockGenesisValidators(client: Client): Promise<Result<ValidatorKeys[]>> {
    console.log("Registering validators")
    
    const keys = Validators as unknown as ValidatorKeys[]
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
        data: keys as ValidatorKeys[]
    }
}

export async function sendTx(client: Client, action: 'inactived' | 'reactived', { address, private_key}: Pick<InstanceKey, 'address' | 'private_key'>) {
    const params = {
        fee: 0,
        senderWallet: address,
        signingSecretKey: private_key,
        validator: address,
        relativeValidityStartHeight: 4
    }

    if (action === 'inactived') {
        return await client.validator.action.inactive.sendTx(params).catch(e => console.error(e))
    } else {
        return await client.validator.action.reactivate.sendTx(params).catch(e => console.error(e))
    }
}

export async function createValidator(client: Client): Promise<Result<ValidatorKeys>> {
    const wallet = await client.account.new();
    if (wallet.error) return { error: wallet.error.message, data: undefined }

    const importKey = await client.account.importRawKey({keyData: wallet.data.privateKey});
    if (importKey.error) return { error: importKey.error.message, data: undefined }

    const isImported = await client.account.isImported({address: wallet.data.address});
    if (isImported.error) return { error: isImported.error.message, data: undefined }

    const unlock = await client.account.unlock({address: wallet.data.address});
    if (unlock.error) return { error: unlock.error.message, data: undefined }

    const constants = await client.constant.params();
    if (constants.error) return { error: constants.error.message, data: undefined }

    const tx = await moveFunds(client, donator.address, wallet.data.address, constants.data!.validatorDeposit)
    if (tx.error) return { error: tx.error.message, data: undefined }

    const params: ValidatorTxParams = {
        fee: 0,
        relativeValidityStartHeight: 4,
        senderWallet: wallet.data.address,
        rewardAddress: wallet.data.address,
        validator: wallet.data.address,
        votingSecretKey: (await getBlsKey()).private_key,
        signingSecretKey: wallet.data.privateKey,
        signalData: '',
    }

    const newValidator = await client.validator.action.new.sendTx(params)
    if (newValidator.error) return { error: newValidator.error.message, data: undefined }
    
    const key = {
        address: wallet.data.address,
        private_key: wallet.data.privateKey,
        public_key: wallet.data.publicKey
    }

    return {
        error: undefined,
        data: {
            active: true,
            address: key,
            reward_address: key,
            signing_key: key
        }
    }
}

export async function deleteValidator(client: Client, validator: ValidatorKeys): Promise<Result<boolean>> {
    const params: DeleteValidatorTxParams = {
        fee: 0,
        relativeValidityStartHeight: 4,
        recipient: validator.address.address,
        validator: validator.address.address,
        value: 1_000_000_000,
    }
    const deletedValidator = await client.validator.action.delete.sendTx(params);
    if (deletedValidator.error) return { error: deletedValidator.error.message, data: undefined }

    return {
        error: undefined,
        data: true
    }
} 