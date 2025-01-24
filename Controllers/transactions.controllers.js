import express from "express";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosAccount } from "aptos";
import { encrypt, decrypt } from "../Utils/Encryption.js";
import {User} from "../Models/user.model.js"

const router = express.Router();

