import React, { useState } from 'react';
import Web3 from 'web3';
import { keccak256 } from 'js-sha3';
import { contractAddress, contractABI } from '../utilities/contractConfig';

const VerifyDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(null);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Function to verify the document
  const verifyDocument = async () => {
    if (!selectedFile) return;
  
    setIsVerifying(true);
    try {
      const web3 = new Web3(window.ethereum);
  
      // Read the file content as a buffer
      const fileBuffer = await selectedFile.arrayBuffer();
      
      // Generate document hash
      const documentHash = keccak256(fileBuffer);
      
      // Log hash values for debugging
      console.log('Document Hash:', documentHash);
  
      // Convert hash to bytes32 without prefix
      const documentHashBytes32 = '0x' + documentHash.padStart(64, '0');
      console.log('Document Hash Bytes32:', documentHashBytes32);
  
      // Create a contract instance
      const contract = new web3.eth.Contract(contractABI, contractAddress);
  
      // Call the verifyDocument function from the smart contract
      const verified = await contract.methods.verifyDocument(documentHashBytes32).call();
      setIsVerified(verified);
    } catch (error) {
      console.error('Error verifying document:', error.message);
    } finally {
      setIsVerifying(false);
    }
  };   

  return (
    <div>
      <h3>Verify Document</h3>
      <input type="file" onChange={handleFileUpload} accept="application/pdf" />

      {selectedFile && (
        <button onClick={verifyDocument} disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify Document'}
        </button>
      )}

      {isVerified !== null && (
        <div>
          {isVerified ? (
            <p>The document is signed and verified!</p>
          ) : (
            <p>The document could not be verified.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyDocument;
