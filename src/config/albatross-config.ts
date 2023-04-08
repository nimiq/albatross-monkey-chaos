import * as toml from '@iarna/toml';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { AlbatrossConfig, Result } from '../types';

const devAlbatrossConfigSchema = z.object({
  name: z.string(),
  seed_message: z.string(),
  timestamp: z.string(),
  vrf_seed: z.string(),
  validators: z.array(
    z.object({
      validator_address: z.string(),
      signing_key: z.string(),
      voting_key: z.string(),
      reward_address: z.string(),
    }),
  ),
  stakers: z.array(
    z.object({
      staker_address: z.string(),
      balance: z.number(),
      delegation: z.string(),
    }),
  ),
  accounts: z.array(
    z.object({
      address: z.string(),
      balance: z.number(),
      private_key: z.string().optional(),
    }),
  ),
});

export function getAlbatrossConfig(config: string): AlbatrossConfig {
  const currentDir = process.cwd();
  const filePath = path.resolve(currentDir, config);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const tomlData = toml.parse(fileContents) as object;
  const result = parse(tomlData);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data!;
}

export function parse(tomlData: object): Result<AlbatrossConfig> {
  const parsedData = devAlbatrossConfigSchema.parse(tomlData);
  console.log(parsedData);

  const donator = parsedData.accounts.find((account) => account.private_key);
  if (!donator) {
    return {
      error: 'No donator account found',
      data: undefined,
    };
  }

  return {
    error: undefined,
    data: {
      ...parsedData,
      donator
    } as AlbatrossConfig,
  }

}
