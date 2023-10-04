import "dotenv/config";
import express, { Request, Response } from "express";
import { Address, Contract } from "./contract";
import { OfflineWallet } from "./wallet";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const wallet = new OfflineWallet();

const tokenContract = new Contract({
  contractId: process.env.CONTRACT_ID!,
  networkPassphrase: process.env.NETWORK_PASSPHRASE!,
  rpcUrl: process.env.RPC_URL!,
  wallet: wallet,
});

app.get("/fund", async (req: Request, res: Response) => {
  const to = "GCTS3FAKRN4MIOUMXDNM22HUPFM4A6WH4PQ5T2KJLBMYH5IO4F74ALKJ";
  const from = await wallet.getUserInfo();

  try {
    const transferResult = await tokenContract.transfer({
      from: Address.fromString(from.publicKey),
      to: Address.fromString(to),
      amount: BigInt(100 * 10 ** 7),
    });
    console.log(transferResult);
  } catch (error) {
    console.log(error);
  }

  res.json({
    message: "Hello World!",
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
