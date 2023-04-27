import { generateBls, generateWallet } from "albatross-util-wasm";
import { ChildProcess, spawn } from "child_process";
import { Address, Client } from "nimiq-rpc-client-ts";
import { createNodeTomlFile } from "../../config/validator-config";
import { MonkeyChaosEvent, Result } from "../../types.d";
import { MonkeyChaos } from "../MonkeyChaos";

export class Validator {
    address!: Address;
    signingKey!: string;
    rewardAddress!: Address;
    votingKey!: string;
    feeKey!: string;
    events: MonkeyChaosEvent[] = [];
    client: Client;
    private filesPath: { logs: string, configuration: string } | undefined
    static index: number = 1;
    name: string;
    childProcess?: ChildProcess;

    constructor() {
        this.client = MonkeyChaos.client;
        this.name = `validator${Validator.index++}`;
    }

    async createValidator(save = true) {
        const wallet = generateWallet();
        this.address = wallet.address as Address;
        this.signingKey = wallet.privateKey;
        this.feeKey = generateWallet().privateKey;
        this.rewardAddress = wallet.address as Address;
        this.votingKey = generateBls().secretKey;
        this.client = MonkeyChaos.client;

        if (save) {
            await this.save();
        }

        return this;
    }

    private async save() {
        const path = `${MonkeyChaos.output}/${this.name}`;
        const template = 'config/template_node_conf.toml.j2';
        const fileResult = await createNodeTomlFile(template, { output: path, validator: this })
        if (!fileResult) throw new Error('Could not create node config file');
        this.filesPath = {
            configuration: fileResult,
            logs: `${path}/${this.name}.log`,
        }
    }

    addEvent(event: MonkeyChaosEvent) {
        this.events.push(event);
    }

    async startProcess(): Promise<Result<boolean>> {
        if (!this.filesPath) return { data: undefined, error: 'No files path' }
        const { configuration, logs } = this.filesPath;
        const command = `${MonkeyChaos.binPath}`;
        const args = ['-c', configuration, '2>&1', '|', 'tee', logs];

        return await new Promise((resolve) => {
            this.childProcess = spawn(command, args);

            this.childProcess.on("error", (error) => {
                const message = `Error starting ${this.name} ${this.address}`
                MonkeyChaos.report.log({ type: 'error', message, details: [command, error.message] })
                resolve({ data: undefined, error: 'Could not start process' });
            });

            this.childProcess.on("exit", (code, signal) => {
                MonkeyChaos.report.log({ type: 'debug', message: `Process ${this.name} ${this.address} exited with code ${code} and signal ${signal}` })
                this.childProcess = undefined;
            });
            resolve({ data: true, error: undefined });
        })
    }

    async killProcess(): Promise<Result<boolean>> {
        return new Promise((resolve) => {
            try {
                if (!this.childProcess) resolve({ data: undefined, error: 'No child process' });
                MonkeyChaos.report.log({ type: 'debug', message: `Killing ${this.name} ${this.address}` });
                this.childProcess!.kill();
            } catch (error) {
                console.log(error)
                const message = `Error killing ${this.name} ${this.address}`
                MonkeyChaos.report.log({ type: 'error', message, details: [JSON.stringify(error)] });
                resolve({ data: undefined, error: `${message}. Error: ${error}` });
            }
        });
    }
}