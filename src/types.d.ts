import { Address } from "nimiq-rpc-client-ts";

export type Action = 'deactivate' | 'reactivate' | 'create' | 'delete';
export type State = 'active' | 'deactivate' | 'deleted';

export type Probabilities = Record<Action, number>;

export type Scenario = {
  probabilities: Probabilities;
  cycles: number;
  timer: [number, number] | number;
};

export type RpcClient = {
  url: string;
}

export type ValidatorConfig = {
  configuration_template: string;
  output_logs: string;
  node_binary_path: string;
}

export type MonkeyChaosConfig = {
  scenario: Scenario;
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
