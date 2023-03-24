// src/main.ts
import { Client } from "nimiq-rpc-client-ts";

// src/data/donator.ts
var donator_default = {
  "address": "NQ87 HKRC JYGR PJN5 KQYQ 5TM1 26XX 7TNG YT27",
  "private_key": "3336f25f5b4272a280c8eb8c1288b39bd064dfb32ebc799459f707a0e88c4e5f"
  // Initial balance = 10_000_000_00000
};

// src/data/bls-keys.ts
var bls_keys_default = [
  {
    "public_key": "1aab34ba2c12b1145424528f356cbae3ebf3f16ac009f314afca94657e710414158864376ab952d2804121679c2a48ee2aeee2bf4e278b5b23939a5ce04e26ca7e82725e957491198c6f56cd1294f950ae7fb4f01ff67c049f8d3bbeae820189c77c1faf3e04616318b011a83e43ddf5fbee4a2023c07bfe99c1f2fa5eed2759d4a2a9dc582a38dd4754ee647e434a2bdb5376c3bb797c6480f8c698befd8645dcff35719ee9fefea2e6895ee4797bf4afb5d337e1a42ba67d7ff32fa700cf62fbbe94bc84338007097c9abb713f58ebb6d8ebc684548037ba63f1e53575b604cf814aa0cf368b0ea8d93ed7965f1c4536d30b964bf92247731990e7d2d5999fe17ec5bc2599476d0b2d8f1a5056af2dc4e1a92c4af1b0f1b191f55801",
    "private_key": "e92a15763dc8585f2d070d1b8527f1ef0de1f960f1dc0d3ca4274be765bc78eba1c7ab0572ba04bb64b9b5e60beecddacf41e202c2a3757921102d3cc5c1e6777f9c733ccc625c0c86e45d5e39b59ead1d708ecbdc0a0b210563411d02de00"
  },
  {
    "public_key": "256a087cfd8bfec2c8d34cccc7f6c90da4b439e8f0dc34522c337adc81d5c8d7ad10473d1e905b0e0382e2417803d3070f3eb932bea5f2d3ddbe794ed51716d3f415bcf5e34b0335319827bbe68077be9c8ee53ff03dff07b5f2196d67d100a59cf1d9806f169c95360918c0998b6d7264f7c57387bc58bfc87e81337e87b56c4e5210cdd989b707cdca19cadc68ae3f625fa7f063a8fc9c03e3ade3ebc2eb2b2f873e596e1cf8efd3187fb51e1226986af6b35bf0b14b8d8c2c26545600fedecd5e842cf4c445da995a67b769c458afeae05bfce3a1c5a775eef709be364cd200d97b8c1509e4ad11a63535e096992e3ca5d3a1305b7f5cdd433dc172317de120f32c68d55276aa9eda310fde772bd80684aa027fee33957d0c3e0e81",
    "private_key": "dcc1840cc2e3f864b08998eec220817adda508bbbcda90b91bfb95bbe0ea0d624f953979b7be82ab73e644221d10ed7c88f4f687541c95e1ae77854c9ba34e74685e5859bbef843858c920fe7c8b06295513a6c23b775311ad3b98b90f7c00"
  },
  {
    "public_key": "e15364927ea2334e7c9472424b0037bcdaa948aca6c4e7ea470c1e47a26ad42532a0395318dfcc1fc039e3684f58d751666d262b8c3a8ad868cc26e3ea82b7c7e766ad0e2511f54ade402f510273becf97bd7ca33b7f3e5f36e194840d5b018ed4289969b9065575312d1c6b13282a17498902c372b3b04f6b1e9a163a9efaf95fcee56c91680fb6e91f681caaddca78fd535e5117f5f10dc1765f142a3f54d4566f54b1353f6b2d79e674149fc9452e89b864415a661673f3aee38e82013c790b92a2e468574288d5dd38b4b39d84a0b7417b8a499dffb5d18a21c6558aadb8fb27ee79d77cca83bd6c5c2a6ccf725a52398218fb9a428f21f00ecb7d686d0dde0a0d76e3feb6076c44fc868928c05c42de8193ecaf38bcede9cd5201",
    "private_key": "1a6930f749f8f010f1eb16fed31ea3252b96c2c770b5b2bd74eaceb7a539647a67d928b8c7810c639f6fef9c454be44ab9184aa4a9b4b12f7c78831229b47b53aa98ab008da07ccbdc673376e56064f36602780135526056ef8fa6a00d7200"
  },
  {
    "public_key": "d8c1d9f14ea75337b32934689222e92bbd325a6dffcb437be0e21d2facbd0cdeb7f4dfe8aa9508551410b4b08bf616967c260a3ba2e15c60e85586a52e4fbf5e205b165315cbf08fa2c0d94470270fd3d10c0e1ad3e75e50febb0822660800b00c10829567278543078982b53315deca0dd03adc1e8b8d4cc5885a7d8f581f801f9e608fc312adddc7ab19aee039824bc7879d4e58ee9c8741e1a43d0106a7466786cdcf449bc2029df34649382c53ef6f6818c7f3445b7c296913ff6d01d7855a3847676fe462bf895cdc95332d19a2f40fac91babe8740d06c1e1c874b5655ad4bf713bc21f97b42a0f645e1739a227f80ebb0dd5642eb080b4e73c67488814da0cee96da27337558114dfd0e46b1007cac73a53b31c38914defbd00",
    "private_key": "1b419371f7962efbda6ff4b7a6bafa3a3ce2aab104f56e135483b424a729bbddfd848e6dfac35b2842254ec0735da5f0c42c0e0e73f3679a4ef7880d6c30ec9d10840c84bed31535a66cd48762ea70924edeea8a20055fef4393c1c8526200"
  },
  {
    "public_key": "3b9abcd385ba7b704a6e0bb21457115df329efe485ca5be1cac4959014465cc8567024171bc7c485ed158c33606557e04047b8e64ebf9dbe76b8006227594a91368b5d116eca9d1a989259c9fefe17f6c381fd103c7e8c69a52650115cb101bb430b6bb272977bbed9c41a26304f2983c3c30f754131b616dec84b1396e2814d399dcd56878c3ae762118b2f7dec70142e99ffd659da6c2257783fe684c0815e06a78dbc1294c9295f165541f18a8690c0df6dbe720cfd40a8b20297d600f087ca74cf0d511260f476363d4a9f3f56cff86f4558f372c3243f8998a0360ac6a90cb6cd96e3186889cb504c4accfc953be0003ab261cdd34737d02aedc4cd882d6f156594748e005a0bfd5bc9847cb2775c18ea99a7ba984a4e5ed40501",
    "private_key": "6eb2d713d8be52eba213c1431b3fe2c5ac1acdc718965cdfa3f5f777e99995617512f00dd0be15ed36141d1d0a4cbd557cdd4fccec718668d48c9d0e6565cdd3d692287dcb45a16e45ebf30f455142a513991c5664680fb8a0122fa946c600"
  }
];

// src/instances/account.ts
async function getBlsKey() {
  return bls_keys_default.shift();
}
async function unlockKey(client, { private_key, address }) {
  const importKey = await client.account.importRawKey({ keyData: private_key }, { timeout: 1e5 });
  if (importKey.error)
    return { error: importKey.error.message, data: void 0 };
  const unlocked = await client.account.unlock({ address }, { timeout: 1e5 });
  if (unlocked.error)
    return { error: unlocked.error.message, data: void 0 };
  return { error: void 0, result: true };
}
async function moveFunds(client, sender, recipient, value) {
  const tx = await client.transaction.send({
    fee: 1e3,
    recipient,
    relativeValidityStartHeight: 5,
    value,
    wallet: sender
  });
  return tx;
}

// src/instances/transactions.ts
async function handleLog(client, address, fn) {
  const { next } = await client.logs.subscribe({ addresses: [address] }, { once: true });
  console.log("Subscribed to logs");
  next(async ({ data, error }) => {
    console.log("Stream");
    console.log({ data, error });
    if (error) {
      console.log({ error, data: void 0 });
      return;
    }
    if (data.transactions.length === 0) {
      console.log({ error: "No transactions", data: void 0 });
    }
    const txData = await client.transaction.get({ hash: data.transactions[0].hash });
    console.log("\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}");
    if (txData.error) {
      console.error(txData);
      throw new Error(`ERROR`);
    }
    fn(txData.data);
  });
}

// src/instances/validator.ts
async function createValidator(client) {
  const wallet = await client.account.new();
  if (wallet.error)
    return { error: wallet.error.message, data: void 0 };
  const importKey = await client.account.importRawKey({ keyData: wallet.data.privateKey });
  if (importKey.error)
    return { error: importKey.error.message, data: void 0 };
  const isImported = await client.account.isImported({ address: wallet.data.address });
  if (isImported.error)
    return { error: isImported.error.message, data: void 0 };
  const unlock = await client.account.unlock({ address: wallet.data.address });
  if (unlock.error)
    return { error: unlock.error.message, data: void 0 };
  const balanceBefore = await client.account.get({ address: wallet.data.address });
  if (balanceBefore.error)
    return { error: balanceBefore.error.message, data: void 0 };
  const donatorBalanceBefore = await client.account.get({ address: donator_default.address });
  if (donatorBalanceBefore.error)
    return { error: donatorBalanceBefore.error.message, data: void 0 };
  async function printBalances(tx2) {
    const balanceAfter = await client.account.get({ address: wallet.data.address });
    if (balanceAfter.error)
      return { error: balanceAfter.error.message, data: void 0 };
    const donatorBalanceAfter = await client.account.get({ address: donator_default.address });
    if (donatorBalanceAfter.error)
      return { error: donatorBalanceAfter.error.message, data: void 0 };
    console.log("-----------balanceBefore--------");
    console.log(`Before: ${balanceBefore.data.balance}`);
    console.log(`Before donator: ${donatorBalanceBefore.data.balance}`);
    console.log(`After: ${balanceAfter.data.balance}`);
    console.log(`After donator: ${donatorBalanceAfter.data.balance}`);
    console.log("-----------balanceBefore--------");
    console.log(tx2);
  }
  handleLog(client, donator_default.address, printBalances);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(1e3);
  const tx = await moveFunds(client, donator_default.address, wallet.data.address, 1e9);
  console.log(tx);
  const fullTx = await client.transaction.get({ hash: tx.data });
  console.log(fullTx);
  const constants = await client.constant.params();
  if (constants.error)
    return { error: constants.error.message, data: void 0 };
  const params = {
    fee: 0,
    relativeValidityStartHeight: 4,
    senderWallet: wallet.data.address,
    rewardAddress: wallet.data.address,
    validator: wallet.data.address,
    votingSecretKey: (await getBlsKey()).private_key,
    signingSecretKey: wallet.data.privateKey,
    signalData: ""
  };
  const newValidator = await client.validator.action.new.sendTx(params);
  console.log(`New validator's tx ${newValidator.data}`);
  const receiptOp = await client.transaction.get({ hash: newValidator.data });
  console.log(`Error ${receiptOp.error?.message}`);
  if (newValidator.error)
    return { error: newValidator.error.message, data: void 0 };
  const key = {
    address: wallet.data.address,
    private_key: wallet.data.privateKey,
    public_key: wallet.data.publicKey
  };
  return {
    error: void 0,
    data: {
      active: true,
      address: key,
      reward_address: key,
      signing_key: key
    }
  };
}
async function deleteValidator(client, validator) {
  const params = {
    fee: 0,
    relativeValidityStartHeight: 4,
    recipient: validator.address.address,
    validator: validator.address.address,
    value: 1e9
  };
  const deletedValidator = await client.validator.action.delete.sendTx(params);
  if (deletedValidator.error)
    return { error: deletedValidator.error.message, data: void 0 };
  return {
    error: void 0,
    data: true
  };
}

// src/main.ts
async function main() {
  const client = new Client(new URL("http://localhost:10200"));
  await unlockKey(client, donator_default);
  const newV = await createValidator(client);
  if (!newV.data)
    throw new Error(newV.error);
  setTimeout(async () => {
    const res = await deleteValidator(client, newV.data);
    console.log("REsults!");
    console.log(res);
  }, 1e4);
}
main();
