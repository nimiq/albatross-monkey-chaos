import * as toml from '@iarna/toml';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { MonkeyChaosConfig, Result } from '../types';

const monkeyChaosConfigSchema = z.object({
  probabilities: z
    .object({
      deactivate: z.number(),
      reactivate: z.number(),
      create: z.number(),
      delete: z.number(),
    })
    .default({
      deactivate: 250,
      reactivate: 250,
      create: 250,
      delete: 250,
    }),
  cycles: z.number().int().default(10),
  timer: z
    .tuple([z.number(), z.number()])
    .or(z.number())
    .default([1, 10]),
});

const donatorSchema = z.object({
  address: z.string(),
  private_key: z.string(),
});

const rpcClientSchema = z.object({
  url: z.string().url(),
});

const validatorConfSchema = z.object({
  configuration_template: z.string().min(1),
  output_logs: z.string().min(1),
  node_binary_path: z.string().min(1),
});

const schema = z.object({
  scenario: monkeyChaosConfigSchema,
  donator: donatorSchema,
  rpcClient: rpcClientSchema,
  validator: validatorConfSchema.optional(),
});

export function getMonkeyChaosConfig(relativeFilePath: string): MonkeyChaosConfig {
  const currentDir = process.cwd();
  const filePath = path.resolve(currentDir, relativeFilePath);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const tomlData = toml.parse(fileContents) as object;
  const parsedData = schema.parse(tomlData) as MonkeyChaosConfig;
  const {error} = validConfig(parsedData);
  if (error) throw new Error(error);
  return parsedData;
}

export function validConfig(parsedData: MonkeyChaosConfig): Result<boolean> {
  const timerValid =
    (typeof parsedData.scenario.timer === 'number' && parsedData.scenario.timer > 0) ||
    (Array.isArray(parsedData.scenario.timer) &&
      parsedData.scenario.timer[0] > 0 &&
      parsedData.scenario.timer[1] > 0 &&
      parsedData.scenario.timer[0] < parsedData.scenario.timer[1]);

  if (!timerValid) {
    return { error: 'Timer value is not valid.', data: undefined }
  }

  const countValid = parsedData.scenario.cycles > 0;

  if (!countValid) {
    return { error: 'Error: Count value must be positive.', data: undefined }
  }

  if (parsedData.validator) {
    const templateValid = parsedData.validator.configuration_template.length > 0;
    if (!templateValid) {
      return { error: 'Validator configuration template path is not valid.', data: undefined }
    }
  }

  return { error: undefined, data: true }
}
