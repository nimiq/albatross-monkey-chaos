import { Client } from "nimiq-rpc-client-ts";
import { loadConfig } from "./config";
import { prepareEnvironment } from "./environment";
import { MonkeyChaos } from "./monkey-chaos/MonkeyChaos";
import { EventsFetcher } from "./EventsFetcher";

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

  const monkeyChaos = new MonkeyChaos(client, { albatrossConfig, monkeyChaosConfig })
  await monkeyChaos.init();

  console.log(`Initialized monkey chaos`)
  const fetcher = new EventsFetcher();
  await fetcher.fillEvents();
  console.log(`Fetched evetns`)
  console.log(fetcher.events)


  // const validator = "NQ45 CRB0 G0ER HH99 RQQ9 PB7E XM2Q HMV0 KM0D"
  // const validatorTxs = await client.transaction.getBy({ address: validator });
  // const txToAction: Record<string, Action> = {
  //   'CreateValidator': 'create',
  //   'DeactivateValidator': 'deactivate',
  //   'ReactivateValidator': 'reactivate',
  //   'DeleteValidator': 'delete',
  // }
  // console.log({validator})
  // const validatorTxsByValidator: Record<`NQ${number} ${string}`, Partial<Omit<MonkeyChaosEvent, 'tx'> & {tx: Transaction}>[]> = {};
  // validatorTxs.data!.forEach((tx) => {
  //   const actionData = parseTxData(tx.data)
  //   console.log(actionData)
  //   console.log(tx)
  //   console.log('----------------')
  // })

  // const stakingContract = (await client.constant.params()).data!.stakingContractAddress;  
  // const stakingTxs = await client.transaction.getBy({ address: stakingContract });
  // if (stakingTxs.error) throw new Error(stakingTxs.error.message);

  // const stakingTxsByValidator: Record<`NQ${number} ${string}`, Partial<Omit<MonkeyChaosEvent, 'tx'> & {tx: Transaction}>[]> = {};

  // stakingTxs.data!.forEach((tx) => {
  //   const actionData = parseTxData(tx.data)
  //   console.log(parseTxData(tx.data))
  //   const action = txToAction[Object.keys(actionData)[0]]
  //   console.log(action)
  //   if (!action) return;
  //   const validator = action === 'delete' ? tx.to : tx.from;
  //   console.log(validator)

  //   if (!stakingTxsByValidator[validator]) stakingTxsByValidator[validator] = [];
  //   stakingTxsByValidator[validator].push({ 
  //     action,
  //     hash: tx.hash,
  //     address: validator,
  //     tx
  //   })
  // })
  // monkeyChaos.report.printReport(stakingTxs)
}

main()