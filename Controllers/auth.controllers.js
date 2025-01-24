import express from "express";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosAccount } from "aptos";
import { encrypt, decrypt } from "../Utils/Encryption.js";
import {User} from "../Models/user.model.js"
import jwt from "jsonwebtoken"
import e from "express";

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Create a new Aptos account
    const account = new AptosAccount();
    const aptos = new Aptos(new AptosConfig({ network: Network.Devnet }));

    try {
      const balance = await aptos.fundAccount({
        accountAddress: account.address(),
        amount: 100000000,
      });
    } catch (error) {
      //console.log(error);
      return res
        .status(500)
        .json({ error: "Failed to fund account", details: error });
    }

    // Encrypt the private key for storage
    const encryptedPrivateKey = account.toPrivateKeyObject().privateKeyHex


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

    const resource = await aptos.getAccountResource({
      accountAddress: account.address(),
      resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    });
    
    return res.status(201).json({
        message: "Signup successful",
        username,
        publicKey: account.pubKey().hex(),
        address: account.address().hex(),
        privateKey: account.toPrivateKeyObject().privateKeyHex,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Signup failed", details: err });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, privateKeyHex } = req.body;

  if (!username || !privateKeyHex) {
    return res
      .status(400)
      .json({ error: "Username and private key are required" });
  }

  try {
    
    const user=await User.findOne({username});

    const storedPrivateKey = (user.privateKey);
    if (storedPrivateKey !== privateKeyHex) {
      return res.status(401).json({ error: "Invalid private key" });
    }

    const accessToken=createAccessToken(user)
    const refreshToken=createRefreshToken(user)

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })


    const cookieOptions = {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      httpOnly: true,
      secure: true, // HTTPS required in production
      sameSite: "none", // Required for cross-origin cookies
    };
    

    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json({
        msg:"Login Successful",
        AT:accessToken,
        RT:refreshToken
    })
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Login failed", details: err });
  }
});


function createAccessToken(user){
  return jwt.sign({
      _id:user._id,
      email:user.email,
      username:user.username,
      fullName:user.fullName
  },process.env.A_SECRET_TOKEN,
  {
      expiresIn:"5h"
  })
}

function createRefreshToken(user){
  return jwt.sign({
      _id:user._id,
  },process.env.R_SECRET_TOKEN,
  {
      expiresIn:"2d"
  })
}

export default router;
