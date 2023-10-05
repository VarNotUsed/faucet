"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineWallet = void 0;
const typescript_wallet_sdk_1 = require("@stellar/typescript-wallet-sdk");
class OfflineWallet {
    constructor() {
        this.connected = true;
        this.allowed = true;
        this.userInfo = {
            publicKey: process.env.PUBLIC_KEY,
        };
        this.signingKeyPair = typescript_wallet_sdk_1.SigningKeypair.fromSecret(process.env.SECRET_KEY);
    }
    async isConnected() {
        // Simulate checking if the wallet is connected
        return this.connected;
    }
    async isAllowed() {
        // Simulate checking if the wallet is allowed
        return this.allowed;
    }
    async getUserInfo() {
        // Simulate fetching user info from the wallet
        return this.userInfo;
    }
    async signTransaction(tx, opts) {
        // Simulate signing a transaction with the wallet
        if (!this.connected || !this.allowed || !this.userInfo.publicKey) {
            throw new Error("Wallet is not connected, allowed, or missing public key");
        }
        const signed = this.signingKeyPair.sign(tx);
        // Perform the actual transaction signing logic here
        // For this example, we'll just return the input transaction as signed
        return signed.toXDR();
    }
    // Additional methods for connecting, allowing, and setting user info
    async connect() {
        this.connected = true;
    }
    async allow() {
        this.allowed = true;
    }
    async setUserInfo(publicKey) {
        this.userInfo.publicKey = publicKey;
    }
}
exports.OfflineWallet = OfflineWallet;
