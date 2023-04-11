import { Address, Client } from "nimiq-rpc-client-ts";
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
  const client = new Client(new URL(monkeyChaosConfig.rpcClient.url));
  await testRpc(client);
  const { error } = await prepareEnvironment(client, albatrossConfig);
  if (error) throw new Error(error);

  const monkeyChaos = new MonkeyChaos(client, {albatrossConfig, monkeyChaosConfig})
  await monkeyChaos.init();

  // Group by validators and explain what they do
  // const stakingContract = (await client.constant.params()).data!.stakingContractAddress;  
  // const validators: Record<Address, any> = {} // address -> {validator, event}
  // monkeyChaos.report.events.forEach(async (e) => {
  //   const tx = await client.transaction.get({hash: e.hash})
  //   console.log(tx)
  //   if (tx.error) {
  //     if (!validators[e.address || 'NQ00 CREATOR']) validators[e.address || 'NQ00 CREATOR'] = []
  //     validators[e.address || 'NQ00 CREATOR'] = [...validators[e.address || 'NQ00 CREATOR'], {...e, error: tx.error}]
  //   } else {
  //     const address = tx.data!.from !== stakingContract ? tx.data!.from : tx.data!.to
  //     if (!validators[address]) validators[address] = []
  //     validators[address] = [...validators[address], e]
  //   }
  // });

  // console.log(validators)

  // Object.entries(validators).forEach(([address, events]) => {
  //   console.group(`Validator: ${address}`)
  //   events.forEach((e: any) => {
  //     console.log(`  - ${e.action} ${e.address} ${e.sucess} ${e.error}`)
  //   })
  //   console.groupEnd()
  // })

}

main()