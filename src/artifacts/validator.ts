import { Client, DeleteValidatorTxParams, MaybeCallResponse, ValidatorTxParams } from "nimiq-rpc-client-ts";
import { InstanceKey, ValidatorKeys } from "../environment";
import donator from "../keys/donator";
import { Result } from "../monkey-chaos";
import { getBlsKey, moveFunds } from "./account";
import { handleLog } from "./transactions";

export async function sendTx(client: Client, action: 'deactivate' | 'reactivate', { address, private_key}: Pick<InstanceKey, 'address' | 'private_key'>): Promise<Result<string>> {
    const params = {
        fee: 0,
        senderWallet: address,
        signingSecretKey: private_key,
        validator: address,
        relativeValidityStartHeight: 4
    }

    if (action === 'deactivate') {
        const req = await client.validator.action.deactive.sendTx(params)
        if (req.error) return { error: req.error.message, data: undefined }
        return { error: undefined, data: req.data }
    } else {
        const req = await client.validator.action.reactivate.sendTx(params)
        if (req.error) return { error: req.error.message, data: undefined }
        return { error: undefined, data: req.data }
    }
}

type NewValidator = { keys: ValidatorKeys, balance: number }
export async function createValidator(client: Client): Promise<Result<NewValidator>> {
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

    const blsKey = await getBlsKey();
    if (blsKey.error) return { error: blsKey.error, data: undefined }

    const params: ValidatorTxParams = {
        fee: 0,
        relativeValidityStartHeight: 4,
        senderWallet: wallet.data.address,
        rewardAddress: wallet.data.address,
        validator: wallet.data.address,
        votingSecretKey: blsKey.data!.privateKey,
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

    return new Promise((resolve) => {
       handleLog(client, wallet.data.address, async (tx) => {
           const balance = await client.account.get({address: key.address});
           if (balance.error) resolve({ error: balance.error.message, data: undefined })
       
           if (balance.data!.balance < constants.data!.validatorDeposit) {
                resolve({ error: 'Validator balance is too low', data: undefined })
           }

           console.log('New Validator tx funding: ')
           console.log(tx)

           resolve({
               error: undefined,
               data: {
                    keys: {
                        active: true,
                        address: key,
                        reward_address: key,
                        signing_key: key
                    },
                    balance: balance.data?.balance || 0
               }
           })
       })
    })
}

export async function removeValidator(client: Client, { address }: InstanceKey): Promise<Result<boolean>> {
    const params: DeleteValidatorTxParams = {
        fee: 0,
        relativeValidityStartHeight: 4,
        recipient: address,
        validator: address,
        value: 1_000_000_000,
    }
    const deletedValidator = await client.validator.action.delete.sendTx(params);
    if (deletedValidator.error) return { error: deletedValidator.error.message, data: undefined }

    return {
        error: undefined,
        data: true
    }
} 