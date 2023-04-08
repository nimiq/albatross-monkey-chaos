import { generateBls, generateWallet } from "albatross-util-wasm";
import { Address, DeleteValidatorTxParams, ValidatorTxParams } from "nimiq-rpc-client-ts";
import { createNodeTomlFile } from "../config/validator-config";
import { Action, Result, ValidatorKeys } from "../types";
import { MonkeyChaos } from "./MonkeyChaos";
import { moveFunds, sleep } from "./utils";
import { exec } from "child_process";
import { resolve } from "path";

type ActionResult = {
    hash: string,
};

type Context = {
    action: Action
    address?: Address
}

type Hash = { hash: string };

export class Actions {
    monkeyChaos: MonkeyChaos;

    constructor(monkeyChaos: MonkeyChaos) {
        this.monkeyChaos = monkeyChaos;
    }

    async run(): Promise<Result<ActionResult> & Context> {
        const { action, validator, onSucess } = this.monkeyChaos.pool.getVictim();
        const address = validator?.validator_address
        switch (action) {
            case 'deactivate':
                const deactivateRes = await this.sendTx('deactivate', validator)
                if(deactivateRes.data) {
                    onSucess();
                    return { data: { hash: deactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: deactivateRes.error, address }
            case 'reactivate':
                const reactivateRes = await this.sendTx('reactivate', validator)
                if(reactivateRes.data) {
                    onSucess();
                    return { data: { hash: reactivateRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: reactivateRes.error, address }
            case 'create':
                const createValidatorRes = await this.createValidator()
                if(createValidatorRes.data) {
                    onSucess(createValidatorRes.data.validator);
                    return { data: { hash: createValidatorRes.data.hash }, address: createValidatorRes.data.validator.validator_address, action, error: undefined }
                }
                return { data: undefined, action, error: createValidatorRes.error, address }
            case 'delete':
                const deleteRes = await this.removeValidator(validator)
                if(deleteRes.data) {
                    onSucess();
                    return { data: { hash: deleteRes.data.hash }, address, action, error: undefined }
                }
                return { data: undefined, action, error: deleteRes.error, address }
        }

    }

    async createValidator() {
        const wallet = generateWallet();
        console.log({wallet: wallet.address, privateKey: wallet.privateKey})
        const address = wallet.address as Address;

        const validatorN = this.monkeyChaos.pool.size() + 1;
        const validatorName = `validator${validatorN}`;
        const outputPath = `${this.monkeyChaos.output}/${validatorName}`;

        const confFile = await createNodeTomlFile('config/template_node_conf.toml.j2', {
            output: outputPath,
            validator: {
                fee_key: generateWallet().privateKey,
                voting_key: generateBls().secretKey,
                signing_key: generateWallet().privateKey,
                validator_address: address,
            },
        })
    
        const importKey = await MonkeyChaos.client.account.importRawKey({keyData: wallet.privateKey});
        console.log({importKey})
        if (importKey.error) return { error: importKey.error.message, data: undefined }
    
        const isImported = await MonkeyChaos.client.account.isImported({ address });
        console.log({isImported})
        if (isImported.error) return { error: isImported.error.message, data: undefined }
    
        const unlock = await MonkeyChaos.client.account.unlock({ address });
        console.log({unlock})
        if (unlock.error) return { error: unlock.error.message, data: undefined }
    
        const constants = await MonkeyChaos.client.constant.params();
        console.log({constants})
        if (constants.error) return { error: constants.error.message, data: undefined }
    
        const tx = await moveFunds(MonkeyChaos.client, this.monkeyChaos.donator.address, address, constants.data!.validatorDeposit)
        console.log({tx})
        if (tx.error) return { error: tx.error.message, data: undefined }
    
        const params: ValidatorTxParams = {
            fee: 0,
            relativeValidityStartHeight: 4,
            senderWallet: address,
            rewardAddress: address,
            validator: address,
            votingSecretKey: generateBls().secretKey,
            signingSecretKey: wallet.privateKey,
            signalData: '',
        }

        const albatrossPath = resolve(process.cwd(), 'config/albatross-config.toml')
        console.log({albatrossPath})
        process.env.NIMIQ_OVERRIDE_DEVNET_CONFIG = albatrossPath
        console.log(`executing ${this.monkeyChaos.binPath} -c ${confFile}`)
        exec(`${this.monkeyChaos.binPath} -c ${confFile} > ${outputPath}/validator.log 2>&1 &`, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                return;
            }
            console.log(stdout)
        })

        await sleep(5000)

        const newValidator = await MonkeyChaos.client.validator.action.new.sendTx(params)
        console.log({newValidator})
        if (newValidator.error) return { error: newValidator.error.message, data: undefined }
        
        return {
            error: undefined,
            data: {
                validator: {
                    reward_address: address,
                    validator_address: address,
                    signing_key: wallet.privateKey,
                    voting_key: params.votingSecretKey,
                },
                hash: newValidator.data!
            }
        }
    }

    async removeValidator({ validator_address }: ValidatorKeys) {
        const params: DeleteValidatorTxParams = {
            fee: 0,
            relativeValidityStartHeight: 4,
            recipient: validator_address,
            validator: validator_address,
            value: 1_000_000_000,
        }
        const deletedValidator = await MonkeyChaos.client.validator.action.delete.sendTx(params);
        if (deletedValidator.error) return { error: deletedValidator.error.message, data: undefined }
    
        return {
            error: undefined,
            data: {
                hash: deletedValidator.data!
            }
        }
    } 

    async sendTx(action: 'deactivate' | 'reactivate', { validator_address, signing_key}: Pick<ValidatorKeys, 'validator_address' | 'signing_key'>): Promise<Result<Hash>> {
        const params = {
            fee: 0,
            senderWallet: validator_address,
            signingSecretKey: signing_key,
            validator: validator_address,
            relativeValidityStartHeight: 4
        }
    
        if (action === 'deactivate') {
            const req = await MonkeyChaos.client.validator.action.deactive.sendTx(params)
            if (req.error) return { error: req.error.message, data: undefined }
            return { error: undefined, data: {hash: req.data} }
        } else {
            const req = await MonkeyChaos.client.validator.action.reactivate.sendTx(params)
            if (req.error) return { error: req.error.message, data: undefined }
            return { error: undefined, data: {hash: req.data} }
        }
    }
}