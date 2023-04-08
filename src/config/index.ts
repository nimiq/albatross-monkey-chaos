import { AlbatrossConfig, MonkeyChaosConfig } from "../types"
import { getAlbatrossConfig } from "./albatross-config";
import { getMonkeyChaosConfig } from "./monkey-chaos-config";

export type Config = {
    albatrossConfig: AlbatrossConfig,
    monkeyChaosConfig: MonkeyChaosConfig
}
export function loadConfig(monkeyChaosConfigPath: string, albatrossConfigPath: string): Config {
    const monkeyChaosConfig = getMonkeyChaosConfig(monkeyChaosConfigPath);
    const albatrossConfig = getAlbatrossConfig(albatrossConfigPath);
    return { albatrossConfig, monkeyChaosConfig };
}