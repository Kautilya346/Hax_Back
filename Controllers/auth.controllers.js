import express from "express";
import { AptosAccount, FaucetClient } from "aptos";
import { encrypt, decrypt } from "../Utils/Encryption.js";
import {User} from "../Models/user.model.js"

const router = express.Router();

// In-memory storage for demo (replace with a database)
const users = {};

// Configure Aptos testnet
const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (users[username]) {
    return res.status(400).json({ error: "Username already exists" });
  }

  try {
    // Create a new Aptos account
    const account = new AptosAccount();

    // Fund the account on the testnet
    //await faucetClient.fundAccount(account.address(), 1000000);

    // Encrypt the private key for storage
    const encryptedPrivateKey = encrypt(account.toPrivateKeyObject().privateKeyHex);

    const user = await User.create({
        email,
        username,
        publicKey: account.pubKey().hex(),
        address: account.address().hex(),
        privateKey: encryptedPrivateKey,
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
        return res.status(400).json({
            message: "Signup failed, User not saved in database",
        });
    }

    return res.status(201).json({
        message: "Signup successful",
        username,
        publicKey: account.pubKey().hex(),
        address: account.address().hex(),
    });
  } catch (err) {
    return res.status(500).json({ error: "Signup failed", details: err });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, privateKeyHex } = req.body;

  if (!username || !privateKeyHex) {
    return res.status(400).json({ error: "Username and private key are required" });
  }

  const user = users[username];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    // Decrypt stored private key
    const storedPrivateKey = decrypt(user.privateKey);

    if (storedPrivateKey !== privateKeyHex) {
      return res.status(401).json({ error: "Invalid private key" });
    }

    return res.status(200).json({
      message: "Login successful",
      username: user.username,
      address: user.address,
      publicKey: user.publicKey,
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
});

export default router;
