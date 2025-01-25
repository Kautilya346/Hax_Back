import express from "express";
import { Aptos, AptosConfig, Network,Account, Ed25519PrivateKey, PrivateKey} from "@aptos-labs/ts-sdk";
import { AptosAccount } from "aptos";
import { encrypt, decrypt } from "../Utils/Encryption.js";
import {User} from "../Models/user.model.js"
import { verifyToken } from "../Middleware/Token.middleware.js";

const router = express.Router();

router.post("/sendmoney", verifyToken,async (req, res) => {
    
    //const currUser=req.user
    const receiverAddress=req.body.receiverAddress
    const privateKeyHex=req.user.privateKey
    const amount = req.body.amount

    const receiverFromDb=await User.findOne({address:receiverAddress})  

    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
   try {
    //const privateKeyHex = "0x9250a9bc32bc15937abf8916ee74e299853e5bfdd1bb08b9804523196d653451";
    // Remove '0x' prefix if present
    const cleanPrivateKeyHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
    const privateKeyBytes = Uint8Array.from(Buffer.from(cleanPrivateKeyHex, 'hex'));
    const privateKey = new Ed25519PrivateKey(privateKeyBytes);
    let sender = Account.fromPrivateKey({ privateKey });

    //let receiver = Account.generate();

    const cleanReceuverKey=receiverFromDb.privateKey.startsWith('0x') ? receiverFromDb.privateKey.slice(2) : receiverFromDb.privateKey;
    const receiverPrivateKeyBytes = Uint8Array.from(Buffer.from(cleanReceuverKey, 'hex'));
    const receiverPrivateKey = new Ed25519PrivateKey(receiverPrivateKeyBytes);
    let receiver = Account.fromPrivateKey({ privateKey: receiverPrivateKey });

    
  
    // await aptos.fundAccount({
    //     accountAddress: receiver.accountAddress,
    //     amount: 10,
    // });

    // const resource1 = await aptos.getAccountResource({
    //     accountAddress: sender.accountAddress,
    //     resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    // });
      

    // console.log("resource1 is",resource1)

    // const resource2 = await aptos.getAccountResource({
    //     accountAddress: receiver.accountAddress,
    //     resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    // });
          
    
    // console.log("resource2 is",resource2)

 
    // 1. Build the transaction to preview the impact of it


    const transaction = await aptos.transaction.build.simple({
      sender: sender.accountAddress,  // Remove toString "0x1::aptos_account::transfer",
      data: {
        // All transactions on Aptos are implemented via smart contracts.
        function: "0x1::aptos_account::transfer",
        functionArguments: [receiver.accountAddress, amount],
        }    
    });
    console.log("done thill here")
 
    // 2. Simulate to see what would happen if we execute this transaction
    const [userTransactionResponse] = await aptos.transaction.simulate.simple({
        signerPublicKey: sender.publicKey,
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

router.get("/getbalance",verifyToken,async (req,res)=>{
    const privateKeyHex=req.user.privateKey
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    try {
        const cleanPrivateKeyHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
        const privateKeyBytes = Uint8Array.from(Buffer.from(cleanPrivateKeyHex, 'hex'));
        const privateKey = new Ed25519PrivateKey(privateKeyBytes);
        let sender = Account.fromPrivateKey({ privateKey });
        const resource = await aptos.getAccountResource({
            accountAddress: sender.accountAddress,
            resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
          });
        res.json({
            message: "Balance fetched",
            resource: resource,
        });
    } catch (error) {
        console.error("Error fetching balances:", error);
    }
});

export default router;