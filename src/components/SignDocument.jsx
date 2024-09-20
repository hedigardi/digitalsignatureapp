import React, { useState } from 'react';
import Web3 from 'web3';
import { keccak256 } from 'js-sha3';
import { contractAddress, contractABI } from '../utilities/contractConfig';

const SignDocument = ({ fileBuffer, setTransactionHash }) => {
  const [isSigning, setIsSigning] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Function to sign the document
  const signDocument = async () => {
    setIsSigning(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
  
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
  
      const contract = new web3.eth.Contract(contractABI, contractAddress);
  
      // Convert fileBuffer (ArrayBuffer) to Uint8Array if necessary
      const uint8Array = new Uint8Array(fileBuffer);
  
      // Hash the file buffer to generate a unique document identifier
      const documentHash = keccak256(uint8Array);
  
      // Convert the document hash to bytes32 format
      const documentHashBytes32 = web3.utils.hexToBytes('0x' + documentHash);
  
      // Sign the document by sending the hash to the contract
      const tx = await contract.methods.signDocument(documentHashBytes32).send({ from: account });
      const transactionHash = tx.transactionHash;
  
      setTransactionHash(transactionHash);
      setTxHash(transactionHash);
    } catch (error) {
      console.error('Error signing document:', error.message);
    } finally {
      setIsSigning(false);
    }
  };   

  return (
    <div>
      <button onClick={signDocument} disabled={isSigning}>
        {isSigning ? 'Signing...' : 'Sign Document'}
      </button>

      {txHash && (
        <div>
          <p>Document has been signed!</p>
          <p>Transaction hash: {txHash}</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

export default SignDocument;
