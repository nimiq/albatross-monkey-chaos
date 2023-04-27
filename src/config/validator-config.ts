import nunjucks from 'nunjucks';
import toml from 'toml';
import fs from 'fs';
import net from 'net';
import { createFolder } from '../monkey-chaos/utils';
import { resolve } from "path"
import { z } from 'zod';
import { Validator } from '../monkey-chaos/validator-state-machine/Validator';

export interface CreateNodeTomlOptions {
  output: string;
  validator: Validator;
}

export interface CreateNodeTomlParams {
  state_path: string;
  validator: {
    validator_address: string;
    signing_key: string;
    voting_key: string;
    fee_key: string;
  };
  rpc_port: number,
  seed_port: number,
}

async function findFreePort(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'string' ? parseInt(address.split(':')[1], 10) :
                  address && typeof address === 'object' ? address.port : null;
      server.close(() => {
        if (typeof port === 'number') {
          resolve(port);
        } else {
          reject(new Error(`Could not determine free port: ${address}`));
        }
      });
    });
  });
}

export async function createNodeTomlFile(templatePath: string, options: CreateNodeTomlOptions) {
  const state_path = createFolder(`${options.output}/state/`)
  const params: CreateNodeTomlParams = {
    rpc_port: await findFreePort(),
    seed_port: await findFreePort(),
    state_path: state_path.data!,
    validator: {
      fee_key: options.validator.feeKey,
      voting_key: options.validator.votingKey,
      signing_key: options.validator.signingKey,
      validator_address: options.validator.address
  },
  }

  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    const renderedTemplate = nunjucks.renderString(template, params);
    toml.parse(renderedTemplate);
    const outputFile = resolve(options.output, "node_conf.toml")
    fs.writeFileSync(outputFile, renderedTemplate)
    return outputFile
  } catch(e) {}
}

const nodeConfigSchema = z.object({
  network: z.object({
    peer_key_file: z.string(),
    listen_addresses: z.array(z.string()),
    seed_nodes: z.array(
      z.object({
        address: z.string(),
      }),
    ),
  }),
  consensus: z.object({
    network: z.string(),
    sync_mode: z.string(),
    min_peers: z.number(),
  }),
  database: z.object({
    path: z.string(),
  }),
  log: z.object({
    level: z.string(),
    timestamps: z.boolean(),
  }),
  log_tags: z.record(z.string()),
});

interface NodeConfig {
  network: {
    peer_key_file: string;
    listen_addresses: string[];
    seed_nodes: {
      address: string;
    }[];
  };
  consensus: {
    network: string;
    sync_mode: string;
    min_peers: number;
  };
  database: {
    path: string;
  };
  log: {
    level: string;
    path: string;
    maxSize: string;
    maxAge: number;
    maxBackups: number;
    compress: boolean;
  };
  log_tags: Record<string, {
    level: string;
  }>;
  state_path: string;
  validator: string;
  rpc_port: number;
  seed_port: number;
}


export function getNodeConfig(config: string): NodeConfig {
  const currentDir = process.cwd();
  const filePath = resolve(currentDir, config, "albatross-config.toml");
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const tomlData = toml.parse(fileContents) as object;
  const result = nodeConfigSchema.parse(tomlData) as unknown as NodeConfig;
  return result;
}