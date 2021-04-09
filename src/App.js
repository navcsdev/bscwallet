import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react';

import Web3 from 'web3'
import bsc from '@binance-chain/bsc-use-wallet';
import abi from 'ethereumjs-abi'
import {
  BscConnector,
  UserRejectedRequestError,
} from '@binance-chain/bsc-connector'
import { UseWalletProvider, useWallet, ConnectionRejectedError } from 'use-wallet';

function App() {
  const wallet = useWallet()
  const blockNumber = wallet.getBlockNumber()

  useEffect(() => {
    console.log('wallet = ', wallet)
    console.log('blockNumber = ', blockNumber)
    // Update the document title using the browser API
    if (typeof window.BinanceChain != "undefined") {
      console.log('window.BinanceChain.isConnected() = ', );
      window.BinanceChain.isConnected().then((result) => {
        console.log('isConnected = ', result);
      })
      window.BinanceChain.requestAccounts().then((result) => {
        console.log('accounts = ', result);
      });
    }
  }, []);

  const sendBNB = () => {
    if (typeof window.BinanceChain != "undefined") {
      const BinanceChain = window.BinanceChain;
      const params = [
        {
          from: '0xC7636168C8967120fF5D383Cb5E2e7996C3765C9',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          gas: '0x76c0', // 30400
          gasPrice: '0x9184e72a000', // 10000000000000
          value: '0x9184e72a', // 2441406250
          data:
            '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ];
      BinanceChain
      .request({
        method: 'eth_sendTransaction',
        params,
      })
      .then((result) => {
        // The result varies by by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
        console.log('result = ', result)
      })
      .catch((error) => {
        // If the request fails, the Promise will reject with an error.
        console.log('error = ', error)
    });
    }
  };

  const mintNFT = async () => {
    if (typeof window.BinanceChain != "undefined") {
      window.web3 = new Web3(window.BinanceChain);
      // params ABI, smart contract address
      window.contract = await new window.web3.eth.Contract([
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            }
          ],
          "name": "mint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "baseURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
      ], '0x9D2809D0dA1A70E140860F0EEb5D98644537d3AA');
      console.log('contract = ', window.contract)
      try {
        const mint = await window.contract.methods
          .mint('0xC7636168C8967120fF5D383Cb5E2e7996C3765C9')
          .send({ from: '0x04af59e12d4de0a057d8e9efae226ff1570b0935',
                  gas: '0x76c0', // 30400
                  gasPrice: '0x9184e72a000', 
                }, (err, res) => {
            if (err) {
              console.log("An error occured", err)
              return
            }
            console.log("Hash of the transaction: " + res)
          });
        console.log('mint = ', mint)
      } catch (ex) {
        console.log(ex);
      }

      const balanceOf = await window.contract.methods.balanceOf('0xC7636168C8967120fF5D383Cb5E2e7996C3765C9').call();
      console.log('balanceOf = ', balanceOf)

      const baseURI = await window.contract.methods.baseURI().call();
      console.log('baseURI = ', baseURI)
  }
  };

  return (
    <>
      <h1>Wallet</h1>
      {wallet.status === 'connected' ? (
        <div>
          <div>Account: {wallet.account}</div>
          <div>Balance: {wallet.balance}</div>
          <button onClick={sendBNB}>Send BNB</button>
          <button onClick={mintNFT}>Mint NFT</button>
          <button onClick={() => wallet.reset()}>disconnect</button>
        </div>
      ) : (
        <div>
          Connect:
          <button onClick={() => wallet.connect()}>MetaMask</button>
          <button onClick={() => wallet.connect('frame')}>Frame</button>
          <button onClick={() => wallet.connect('portis')}>Portis</button>
          <button onClick={() => wallet.connect('bsc')}>BSC</button>
        </div>
      )}
    </>
  );
}

// Wrap everything in <UseWalletProvider />
export default () => (
  (
    <UseWalletProvider connectors={{
      bsc: {
        web3ReactConnector() {
          return new BscConnector({ supportedChainIds: [56, 97] })
        },
        handleActivationError(err) {
          if (err instanceof UserRejectedRequestError) {
            return new ConnectionRejectedError()
          }
        },
      },
    }} chainId={97}>
      <App />
    </UseWalletProvider>
  )
)
