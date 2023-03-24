import { getBlsKey } from "./artifacts/account";

async function main(){
    const blsKeys = await getBlsKey();
    if (blsKeys.error) throw new Error(blsKeys.error);
    console.log(blsKeys.data);
}

main();