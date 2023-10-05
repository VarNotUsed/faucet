import "dotenv/config";
import express, { Request, Response } from "express";
import { OfflineWallet } from "./wallet";
import * as SorobanClient from "soroban-client";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const wallet = new OfflineWallet();

let keypair = SorobanClient.Keypair.fromSecret(process.env.SECRET_KEY);

app.get("/fund", async (req: Request, res: Response) => {
  const to = "GCTS3FAKRN4MIOUMXDNM22HUPFM4A6WH4PQ5T2KJLBMYH5IO4F74ALKJ";
  const from = await wallet.getUserInfo();
  const server = new SorobanClient.Server(process.env.RPC_URL);
  let account = await server.getAccount(from.publicKey);

  try {
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: SorobanClient.Networks.FUTURENET,
    })
      .addOperation(
        SorobanClient.Operation.payment({
          destination: to,
          asset: SorobanClient.Asset.native(),
          amount: "100",
        })
      )
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
    transaction.sign(keypair);
    console.log(transaction);
    const res = await server.sendTransaction(transaction);
    console.log(res);
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
