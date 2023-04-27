import { Address, Transaction } from "nimiq-rpc-client-ts"
import { Validator } from "./monkey-chaos/validator-state-machine/Validator"

export enum Action {
  CREATE = 'create',
  DEACTIVATE = 'deactivate',
  REACTIVATE = 'reactivate',
  RETIRE = 'retire',
  DELETE = 'delete',
}

export enum AsyncAction {
  ASYNC_DEACTIVATE = 'async_deactivate',
  ASYNC_DELETE = 'async_delete',
}

export enum State {
  ACTIVATED = 'activated',
  WAITING_DEACTIVATION = 'waiting_deactivation',
  DEACTIVATED = 'deactivated',
  RETIRED = 'retired',
  WAITING_DELETION = 'waiting_deletion',
  DELETED = 'deleted',
}

export type Weights = Record<Action, number>

export type Scenario = {
  weights: Weights
  cycles: number
  timer: [number, number] | number
}

export type RpcClient = {
  url: string
}

export type ValidatorConfig = {
  configuration_template: string
  output_logs: string
  node_binary_path: string
}

export type MonkeyChaosConfig = {
  scenario: Scenario
  donator: InstanceKey;
  rpcClient: RpcClient;
  validator: ValidatorConfig;
};

export type AlbatrossConfig = {
  name: string;
  seed_message: string;
  timestamp: string;
  vrf_seed: string;
  validators: ValidatorKeys[];
  stakers: {
    staker_address: Address;
    balance: number;
    delegation: string;
  }[]
  accounts: {
    address: Address;
    balance: number;
  }[]
  donator: Wallet & { balance: number };
};

export type Wallet = { address: Address; private_key: string }
export type ValidatorKeys = { validator_address: Address, signing_key: string, voting_key: string; reward_address: `NQ${number} ${string}`; }

export type Result<T> = {
  error: string,
  data: undefined
} | {
  error: undefined,
  data: T
}

export type Hash = {
  hash: string
}

export type MonkeyChaosExecution = {
  time: string,
  action: Action
  validator: Validator
  states: [State | undefined, State]
  index: number;
};

export type ErrorMonkeyChaosExecution = MonkeyChaosExecution & {
  error: string
  tx: undefined
}

export type OkMonkeyChaosExecution = MonkeyChaosExecution & {
  error: undefined
  tx: Transaction
} 

export type MonkeyChaosEvent = ErrorMonkeyChaosExecution | OkMonkeyChaosExecution

export type MonkeyChaosEventsDict = Map<Address, MonkeyChaosEvent>

export type TransferParams = {
  wallet: Address;
  recipient: Address;
  value: number;
}