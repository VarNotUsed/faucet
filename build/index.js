"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const wallet_1 = require("./wallet");
const SorobanClient = __importStar(require("soroban-client"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
// Apply the rate limiting middleware to all requests
//app.use(limiter)
const wallet = new wallet_1.OfflineWallet();
let keypair = SorobanClient.Keypair.fromSecret(process.env.SECRET_KEY);
app.get("/", async (req, res) => {
    res.send("Hello World!");
});
app.post("/fund", async (req, res) => {
    const { to, amount } = req.body;
    const from = await wallet.getUserInfo();
    const server = new SorobanClient.Server(process.env.RPC_URL);
    let account = await server.getAccount(from.publicKey);
    try {
        let transaction = new SorobanClient.TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: SorobanClient.Networks.FUTURENET,
        })
            .addOperation(SorobanClient.Operation.payment({
            destination: to,
            asset: SorobanClient.Asset.native(),
            amount: amount,
        }))
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();
        transaction.sign(keypair);
        console.log(transaction);
        const transactionRes = await server.sendTransaction(transaction);
        console.log(res);
        let queryResult;
        do {
            await new Promise((resolve) => setTimeout(resolve, 200));
            queryResult = await server.getTransaction(transactionRes.hash);
            console.log(queryResult);
        } while (queryResult.status !== "SUCCESS");
        res.json({
            status: "SUCCESS",
            transaction: queryResult,
        });
    }
    catch (error) {
        res.json({
            status: "ERROR",
            error: error,
        });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
