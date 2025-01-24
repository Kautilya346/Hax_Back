import express from "express";
import { Aptos, AptosConfig, Network,Account} from "@aptos-labs/ts-sdk";
import { AptosAccount } from "aptos";
import { encrypt, decrypt } from "../Utils/Encryption.js";
import {User} from "../Models/user.model.js"
import { verifyToken } from "../Middleware/Token.middleware.js";

const router = express.Router();

router.post("/sendmoney", verifyToken,async (req, res) => {
    
    const currUser=req.user
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
   try {
    const privateKeyHex = "18be24659b2f20632f7b37ac8ae086d7c5f3d5d752337b29d6a4202aac157e93";
    const privateKeyBuffer = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    let sender = new AptosAccount(privateKeyBuffer);
    let receiver = Account.generate();
 
    // 0. Setup the client and test accounts
    
 
    await aptos.fundAccount({
        accountAddress: sender.accountAddress,
        amount: 100_000_000,
    });

    await aptos.fundAccount({
        accountAddress: receiver.accountAddress,
        amount: 10,
    });

    const resource1 = await aptos.getAccountResource({
        accountAddress: sender.accountAddress,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      });
      

        console.log("resource1 is",resource1)

        const resource2 = await aptos.getAccountResource({
            accountAddress: receiver.accountAddress,
            resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
          });
          
    
            console.log("resource2 is",resource2)

 
    // 1. Build the transaction to preview the impact of it


    const transaction = await aptos.transaction.build.simple({
        sender: sender.address().toString(),
        data: {
        // All transactions on Aptos are implemented via smart contracts.
        function: "0x1::aptos_account::transfer",
        functionArguments: [receiver.accountAddress, 100],
        },
    });
 
    // 2. Simulate to see what would happen if we execute this transaction
    const [userTransactionResponse] = await aptos.transaction.simulate.simple({
        signerPublicKey: sender.pubKey().toString(),
        transaction,
    });

      // 3. Sign
      console.log("\n=== 3. Signing transaction ===\n");
      const senderAuthenticator = aptos.transaction.sign({
          signer: sender,
          transaction,
      });
      console.log("Signed the transaction!")
   
      // 4. Submit
      console.log("\n=== 4. Submitting transaction ===\n");
      const submittedTransaction = await aptos.transaction.submit.simple({
          transaction,
          senderAuthenticator,
      });
   
      //console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);
   
      // 5. Wait for results
      console.log("\n=== 5. Waiting for result of transaction ===\n");
      const executedTransaction = await aptos.waitForTransaction({ transactionHash: submittedTransaction.hash });
     // console.log("Imp is",executedTransaction)

    const resource = await aptos.getAccountResource({
        accountAddress: sender.accountAddress,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      });
      

        console.log("resource is",resource)

        const resource3 = await aptos.getAccountResource({
            accountAddress: receiver.accountAddress,
            resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
          });
          
    
            console.log("resource3 is",resource3)

        //console.log(userTransactionResponse)

        res.json({
            message: "Transaction successful",
            sender: sender.accountAddress,
            receiver: receiver.accountAddress,
            resource: resource,
            userTransactionResponse: userTransactionResponse,
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    });

export default router;