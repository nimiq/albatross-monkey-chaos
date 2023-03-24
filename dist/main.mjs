// src/main.ts
import { Client } from "nimiq-rpc-client-ts";

// src/artifacts/account.ts
import { exec } from "child_process";
import path from "path";
function getBlsKey() {
  return new Promise((resolve) => {
    const currentDir = process.cwd();
    const cargoTomlPath = path.resolve(currentDir, "..", "core-rs-albatross", "Cargo.toml");
    const command = `RUSTFLAGS='-C codegen-units=1' cargo run --quiet --manifest-path ${cargoTomlPath} --bin nimiq-bls`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        resolve({ error: error.message, data: void 0 });
      }
      if (stderr) {
        console.error(`Standard error: ${stderr}`);
        resolve({ error: stderr, data: void 0 });
      }
      const outputLines = stdout.trim().split("\n").filter(Boolean);
      const blsKeys = {
        publicKey: outputLines[1].trim(),
        privateKey: outputLines[3].trim(),
        proofOfKnowledge: outputLines[5].trim()
      };
      resolve({ error: void 0, data: blsKeys });
    });
  });
}
async function unlockKey(client2, { private_key, address }) {
  const importKey = await client2.account.importRawKey({ keyData: private_key }, { timeout: 1e5 });
  if (importKey.error)
    return { error: importKey.error.message, data: void 0 };
  const unlocked = await client2.account.unlock({ address }, { timeout: 1e5 });
  if (unlocked.error)
    return { error: unlocked.error.message, data: void 0 };
  return { error: void 0, result: true };
}
async function moveFunds(client2, sender, recipient, value) {
  const tx = await client2.transaction.send({
    fee: 1e3,
    recipient,
    relativeValidityStartHeight: 5,
    value,
    wallet: sender
  });
  return tx;
}

// src/keys/donator.ts
var donator_default = {
  "address": "NQ87 HKRC JYGR PJN5 KQYQ 5TM1 26XX 7TNG YT27",
  "private_key": "3336f25f5b4272a280c8eb8c1288b39bd064dfb32ebc799459f707a0e88c4e5f"
  // Initial balance = 10_000_000_00000
};

// src/keys/validator-keys.ts
var validator_keys_default = [
  {
    "address": {
      "address": "NQ56 4PTS 5DEJ 39GQ A3LX DY6A 92U2 ACSV 5K23",
      "address_raw": "25f7a2b5d21a61850e9e6fcca48b825335d2cc43",
      "public_key": "bb436fcd868b65053ccc49166beaf3451388b94cce9d7b611fd8c64f04ee1d25",
      "private_key": "18612a398ef1c32825149dd0b6a3a8218b6b619b855433fa1d7bab2bf09628d6"
    },
    "signing_key": {
      "address": "NQ13 C7HC RQ75 1CHX RPM2 A8A1 D1X9 2RKQ JQX1",
      "address_raw": "61e2cce0e50b23ecdea252141687c916678963c1",
      "public_key": "3c75f9f607f24de31638ad91d70169223da632a6c0d890bb570238f377e8f44d",
      "private_key": "6622c78dee4f062cfb5a2e2b8d4a2b420541b5312305df1022a7269848ccc339"
    },
    "reward_address": {
      "address": "NQ94 01CB 4TNA PH0X DGNY 0HLX XKLJ CTXY 0RH1",
      "address_raw": "0058b26ecabc41e6c2df0469ef4e9266fdf06621",
      "public_key": "62a74ccff48ba46097a2304138ba65800121bbf31d9ea4ada795fb672f8f8f0a",
      "private_key": "e0b5c5e78c4428fd00a655151498172d7900fb5e6c2b06698b693152a6160dc4"
    }
  },
  {
    "address": {
      "address": "NQ96 E6EN 1X8N EKYJ 21S6 SQRH 1H1S FLP3 LTEF",
      "address_raw": "719d60f91674ff210746d63310c43a7d2e3a6dcf",
      "public_key": "688cbaa50c4c599af93d75cef3a457be6c100d02b600c5860828445430bb9d62",
      "private_key": "f96e4d651a13a0fc4efc810c2376f8e06ad664f54009481465d90bb7ec41b5c0"
    },
    "signing_key": {
      "address": "NQ32 1M76 PGV9 F0TT 0TML FN1T VSQK 78T4 N0H4",
      "address_raw": "0d4e6bc3a97837b06eb47d83beeb133a364b0224",
      "public_key": "e05438827507fc5e0a14642a87ad4b721455c243e858fdd69ee0a095fae5183d",
      "private_key": "dd76724916d6ae39ea5afaca6a2c5b4eff6af72682502edc4cc976f46bad3042"
    },
    "reward_address": {
      "address": "NQ29 0RF2 N3AY YP3L J6N0 5JCF KY9M UJ80 KXVK",
      "address_raw": "065e2b0d5ffdc7491ac02c98f9fd35e49009fbb3",
      "public_key": "4490fa94f5b6ded593dac2672c1bba6619e95e4f9c37217a97b335572a337e9c",
      "private_key": "a7e7af55b582d44ff4aa349badd009cfe4eee9a1a7012668f42083117e18e191"
    }
  },
  {
    "address": {
      "address": "NQ42 BVGM GMHT YCDV MX10 NCM8 ALG1 BX0M BHXX",
      "address_raw": "5f6158563bfb1bdaf820b32a8552015f8155c7de",
      "public_key": "eb131464edb39670b7b0f4c06df312b9c1d57960969a31373134559f248956b0",
      "private_key": "04feab2db8c11d128fc8d1253337563924bd93889c720fac4204992d1450c7fd"
    },
    "signing_key": {
      "address": "NQ45 NLQS 4M7P 984R S4V9 Q5E9 6HVS M047 1HUS",
      "address_raw": "b531a254f74a099d13a9c15c9347baa80870c79a",
      "public_key": "51332744cd2d6d18a5dde2ce7c48ce14496595a44c8d3f431bc6e661bd4a5b2f",
      "private_key": "64bdee53c009327861ddd84bec1d21a21190440cc6d2c20fa60e67289f27eaef"
    },
    "reward_address": {
      "address": "NQ19 RLF0 R38Y NLHN 7AGQ H4KT RT86 D1DU 23UC",
      "address_raw": "cd1e0c8d1fb52363aa188927bced06685bc10f8c",
      "public_key": "fe82f74a627c5f80b14c1f5020a6880ec47072a98cb160794b0201176a0b189e",
      "private_key": "82c527da5a2b2e579019067a124229674699f84daf6552b18fb36f4ecc9d1a0c"
    }
  },
  {
    "address": {
      "address": "NQ78 UXTQ 7QG8 YB2S Q4VY U78E 2VU2 K6M0 9D0H",
      "address_raw": "e7b783e208fac5ac13bfe1d0e1778299aa04b411",
      "public_key": "a42496c5663196a6b459819939474e8d139489de9d0c387d89c157dfbb7a9a26",
      "private_key": "b7eefd47584540e6c6169d6e36eea5639a9e393c812fe6b5b98cfccc560ab4f1"
    },
    "signing_key": {
      "address": "NQ07 BRV9 10HD CYK4 E5TK F766 14JX KRUE M4JP",
      "address_raw": "5e7a90822d67e647177379cc60925e9e78ea9257",
      "public_key": "68929237aadb83f61dbb48d2dacc103734d9d4a6a14ac6b02d5716ecb154a074",
      "private_key": "9f15973dc5b1e9b7b3f5cf4d354eb24968bf579599e39c76d0ff0ee4d19f99ab"
    },
    "reward_address": {
      "address": "NQ81 5JCC 3N75 NPR7 6KKX KVJE 8VTV DXKF R5SX",
      "address_raw": "2c98c1d8e5b5f2734e7e9f64e4777d6fa6fc975e",
      "public_key": "bf636b7fabf474077aa51772cae93d28cf9b5236dc0f0c968661f4f6b4ba5957",
      "private_key": "28868ee2e69294501f24756899e2d5e64423dbd6d0b6ebebfda257e33fcaaf89"
    }
  }
];

// src/environment.ts
async function unlockGenesisValidators(client2) {
  const keys = validator_keys_default;
  const promises = keys.map(async (v) => {
    await unlockKey(client2, v.address);
    await unlockKey(client2, v.signing_key);
    await unlockKey(client2, v.reward_address);
  });
  await Promise.all(promises);
  const listReq = await client2.account.list();
  if (listReq.error)
    return { error: listReq.error.message, data: void 0 };
  const list = listReq.data;
  console.log(`List of accounts: ${list.length}`);
  console.log(list);
  console.log("\n\n\n");
  return {
    error: void 0,
    data: keys.map((v) => ({ ...v, active: true }))
  };
}
async function prepareEnvironment(client2, options) {
  let validators = void 0;
  let donatorInfo = void 0;
  if (options.unlockValidators) {
    const res = await unlockGenesisValidators(client2);
    if (res.error)
      return { error: res.error, data: void 0 };
    validators = res.data;
  }
  if (options.unlockDonator) {
    const res = await unlockKey(client2, donator_default);
    if (res.error)
      return { error: res.error, data: void 0 };
  }
  return {
    error: void 0,
    // @ts-ignore
    data: {
      validators,
      donator: donator_default
    }
  };
}

// src/artifacts/transactions.ts
async function handleLog(client2, address, fn) {
  const { next } = await client2.logs.subscribe({ addresses: [address] }, { once: true });
  next(async ({ data, error }) => {
    if (error) {
      console.log({ error, data: void 0 });
      return;
    }
    if (data.transactions.length === 0) {
      console.log({ error: "No transactions", data: void 0 });
    }
    const txData = await client2.transaction.get({ hash: data.transactions[0].hash });
    if (txData.error) {
      console.error(txData);
      throw new Error(txData.error.message);
    }
    fn(txData.data);
  });
}

// src/artifacts/validator.ts
async function sendTx(client2, action, { address, private_key }) {
  const params = {
    fee: 0,
    senderWallet: address,
    signingSecretKey: private_key,
    validator: address,
    relativeValidityStartHeight: 4
  };
  if (action === "deactivate") {
    const req = await client2.validator.action.deactive.sendTx(params);
    if (req.error)
      return { error: req.error.message, data: void 0 };
    return { error: void 0, data: req.data };
  } else {
    const req = await client2.validator.action.reactivate.sendTx(params);
    if (req.error)
      return { error: req.error.message, data: void 0 };
    return { error: void 0, data: req.data };
  }
}
async function createValidator(client2) {
  const wallet = await client2.account.new();
  if (wallet.error)
    return { error: wallet.error.message, data: void 0 };
  const importKey = await client2.account.importRawKey({ keyData: wallet.data.privateKey });
  if (importKey.error)
    return { error: importKey.error.message, data: void 0 };
  const isImported = await client2.account.isImported({ address: wallet.data.address });
  if (isImported.error)
    return { error: isImported.error.message, data: void 0 };
  const unlock = await client2.account.unlock({ address: wallet.data.address });
  if (unlock.error)
    return { error: unlock.error.message, data: void 0 };
  const constants = await client2.constant.params();
  if (constants.error)
    return { error: constants.error.message, data: void 0 };
  const tx = await moveFunds(client2, donator_default.address, wallet.data.address, constants.data.validatorDeposit);
  if (tx.error)
    return { error: tx.error.message, data: void 0 };
  const blsKey = await getBlsKey();
  if (blsKey.error)
    return { error: blsKey.error, data: void 0 };
  const params = {
    fee: 0,
    relativeValidityStartHeight: 4,
    senderWallet: wallet.data.address,
    rewardAddress: wallet.data.address,
    validator: wallet.data.address,
    votingSecretKey: blsKey.data.privateKey,
    signingSecretKey: wallet.data.privateKey,
    signalData: ""
  };
  const newValidator = await client2.validator.action.new.sendTx(params);
  if (newValidator.error)
    return { error: newValidator.error.message, data: void 0 };
  const key = {
    address: wallet.data.address,
    private_key: wallet.data.privateKey,
    public_key: wallet.data.publicKey
  };
  return new Promise((resolve) => {
    handleLog(client2, wallet.data.address, async () => {
      const balance = await client2.account.get({ address: key.address });
      if (balance.error)
        resolve({ error: balance.error.message, data: void 0 });
      if (balance.data.balance < constants.data.validatorDeposit) {
        resolve({ error: "Validator balance is too low", data: void 0 });
      }
      resolve({
        error: void 0,
        data: {
          keys: {
            active: true,
            address: key,
            reward_address: key,
            signing_key: key
          },
          balance: balance.data?.balance || 0
        }
      });
    });
  });
}
async function removeValidator(client2, { address }) {
  const params = {
    fee: 0,
    relativeValidityStartHeight: 4,
    recipient: address,
    validator: address,
    value: 1e9
  };
  const deletedValidator = await client2.validator.action.delete.sendTx(params);
  if (deletedValidator.error)
    return { error: deletedValidator.error.message, data: void 0 };
  return {
    error: void 0,
    data: true
  };
}

// src/monkey-chaos.ts
var client;
var actions = ["deactivate", "reactivate", "create", "delete"];
function playRoulette(validators, probabilities2) {
  const action = actions[Math.floor(Math.random() * actions.length)];
  if (action === "create")
    return { action, validator: void 0 };
  const validator = validators[Math.floor(Math.random() * validators.length)];
  if (action === "delete")
    return { action, validator };
  if (action === "deactivate" && validator.active)
    return { action, validator };
  if (action === "reactivate" && !validator.active)
    return { action, validator };
  return playRoulette(validators, probabilities2);
}
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function monkeyChaosLoop(validators, { count, probabilities: probabilities2, timer }, report) {
  while (count > 0) {
    count--;
    const { action, validator } = playRoulette(validators, probabilities2);
    console.log(`\u{1F64A}  Monkey chose to ${action} validator ${validator?.address.address || ""}`);
    let req;
    let meta;
    switch (action) {
      case "deactivate":
        req = await sendTx(client, "deactivate", validator.signing_key);
        break;
      case "reactivate":
        req = await sendTx(client, "reactivate", validator.signing_key);
        break;
      case "create":
        req = await createValidator(client);
        if (req.data) {
          validators.push(req.data.keys);
          meta = req.data.balance;
        }
        break;
      case "delete":
        req = await removeValidator(client, validator.address);
        break;
    }
    const timestamp = /* @__PURE__ */ new Date();
    const ms = `00${timestamp.getMilliseconds()}`.slice(-3);
    const time = `${timestamp.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/:/g, ":")}:${ms}`;
    const block = await client.block.current();
    if (block.error)
      throw new Error(block.error.message);
    report.push({
      output: req && req.error ? "\u274C" : "\u2705",
      action,
      validator: validator?.address.address || validators.at(-1)?.address.address || "",
      block: block.data,
      time,
      meta: req.error || meta || ""
    });
    if (req && req.error) {
      console.log(`	\u274C  Something went wrong: ${req?.error}`);
      console.log(req);
    } else {
      console.log(`	\u2705  Success`);
    }
    req = void 0;
    meta = void 0;
    let randomTime;
    if (typeof timer === "number")
      randomTime = timer;
    else
      randomTime = Math.floor(Math.random() * (timer[1] - timer[0])) + timer[0];
    console.log(`\u{1F648}  Sleeping for ${randomTime} seconds...`);
    await sleep(randomTime * 1e3);
  }
}
async function monkeyChaos(client_, validators, config) {
  const sum = Object.values(config.probabilities).reduce((acc, val) => acc + val, 0);
  if (sum !== 1e3)
    throw new Error(`Use integers between 0-1000. Probabilities must sum up to 1000. Current sum ${sum}}`);
  if (typeof config.timer === "number" && config.timer < 0)
    throw new Error("Timer must be positive");
  if (Array.isArray(config.timer) && config.timer[0] < 0)
    throw new Error("Timer must be positive");
  if (Array.isArray(config.timer) && config.timer[0] > config.timer[1])
    throw new Error("Second timer value must be greater than first");
  client = client_;
  const accumulativeProbabilities = Object.entries(config.probabilities).reduce((acc, [key, value], i) => ({ ...acc, [key]: i === 0 ? value : acc[Object.keys(acc)[i - 1]] + value }), {});
  console.log(`\u{1F412}  Starting Monkey Chaos...`);
  console.log(`\u{1F435}  It will run ${config.count} in intervals of ${config.timer}s times with the following probabilities:`);
  const table = Object.entries(config.probabilities).map(([action, probability]) => {
    return {
      action,
      probability: `${(probability / 10).toFixed(2)}%`
    };
  });
  console.table(table);
  console.log(`\u{1F435}  With the validators from the genesis file:`);
  console.table(validators.map(({ address, active }) => ({ address: address.address, active })));
  const report = [];
  await monkeyChaosLoop(validators, { ...config, probabilities: accumulativeProbabilities }, report);
  console.log(`\u{1F412}  Monkey Chaos finished...`);
  console.log(`\u{1F4DD}  Report:`);
  console.table(report);
}

// src/main.ts
var probabilities = {
  "deactivate": 450,
  "reactivate": 450,
  "create": 50,
  "delete": 50
};
async function main() {
  const client2 = new Client(new URL("http://localhost:10200"));
  const { data, error } = await prepareEnvironment(client2, { unlockValidators: true, unlockDonator: true });
  if (error)
    throw new Error(error);
  await monkeyChaos(client2, data?.validators, { probabilities, count: 60, timer: 2 });
}
main();
