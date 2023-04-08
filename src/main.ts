import { Client } from "nimiq-rpc-client-ts";
import { loadConfig } from "./config";
import { prepareEnvironment } from "./environment";
import { MonkeyChaos } from "./monkey-chaos/MonkeyChaos";

async function testRpc(client: Client) {
  if ((await client.block.current()).data === undefined) throw new Error('RPC not working')
}

async function main() {
  const monkeyChaosConfigPath = "./config/monkey-chaos-config.toml"
  const albatrossConfigPath = "./config/albatross-config.toml"
  const { albatrossConfig, monkeyChaosConfig } = loadConfig(monkeyChaosConfigPath, albatrossConfigPath);
  console.log('albatrossConfig: ', albatrossConfig)
  const client = new Client(new URL(monkeyChaosConfig.rpcClient.url));
  await testRpc(client);
  const { error } = await prepareEnvironment(client, albatrossConfig);
  if (error) throw new Error(error);

  const monkeyChaos = new MonkeyChaos(client, {albatrossConfig, monkeyChaosConfig})
  await monkeyChaos.init();

  await Promise.all(monkeyChaos.report.events.map(async ({ hash, action, address }) => {
    const tx = await client.transaction.get({ hash });
    console.log('------------')
    console.log('hash: ', hash)
    console.log('action: ', action)
    console.log('validator: ', address)
    if (tx.error) console.log(`ERROR: ${tx.error.message}`)
    else console.log('data: ', tx.data?.data!)
    console.log('------------')
  }));

}

main()