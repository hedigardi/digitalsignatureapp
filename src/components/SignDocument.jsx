import React, { useState } from 'react';
import Web3 from 'web3';
import QRCode from 'qrcode';
import { contractAddress } from '../utilities/contractConfig'; // Import contract address
import { keccak256 } from 'js-sha3'; // Import SHA3 hash function for hashing
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';

// Generate QR Code URL
const generateQRCodeUrl = async (transactionUrl) => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(transactionUrl);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Embed QR Code into PDF
const addQRCodeToPDF = async (pdfBytes, qrCodeDataUrl) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const qrImage = await pdfDoc.embedPng(qrCodeDataUrl); // Embed the QR code image into the PDF
  const { width, height } = firstPage.getSize();

  // Add the QR code image to the bottom-right of the first page
  firstPage.drawImage(qrImage, {
    x: width - 160,
    y: 20,
    width: 140,
    height: 140,
  });

  // Save the modified PDF and return the bytes
  const modifiedPdfBytes = await pdfDoc.save();
  return modifiedPdfBytes;
};

// Upload the PDF to IPFS
const uploadToIPFS = async (pdfBytes) => {
  const formData = new FormData();
  formData.append('file', new Blob([pdfBytes], { type: 'application/pdf' }));

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: 'YOUR_PINATA_API_KEY', // Replace with your Pinata API key
        pinata_secret_api_key: 'YOUR_PINATA_SECRET_API_KEY' // Replace with your Pinata secret API key
      }
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

const SignDocument = ({ fileHash, setTransactionHash }) => {
  const [isSigning, setIsSigning] = useState(false);
  const [transactionHash, setTxHash] = useState(null);  // Track transaction hash
  const [qrCodeUrl, setQrCodeUrl] = useState(null);  // Track QR code data URL

  const signDocument = async () => {
    setIsSigning(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      if (!contractAddress) {
        throw new Error('Contract address is not defined');
      }

      const contract = new web3.eth.Contract([{
        "inputs": [{ "internalType": "bytes32", "name": "_documentHash", "type": "bytes32" }],
        "name": "signDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }], contractAddress);

      const hashedFileHash = keccak256(fileHash);
      const paddedData = '0x' + hashedFileHash.slice(0, 64);

      const tx = await contract.methods.signDocument(paddedData).send({ from: account });
      const txHash = tx.transactionHash;
      setTransactionHash(txHash);
      setTxHash(txHash);

      const transactionUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
      const qrCodeUrl = await generateQRCodeUrl(transactionUrl);
      setQrCodeUrl(qrCodeUrl);

      // Download the PDF file from IPFS
      const pdfResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${fileHash}`);
      const pdfBytes = await pdfResponse.arrayBuffer();
      const modifiedPdfBytes = await addQRCodeToPDF(pdfBytes, qrCodeUrl);
      const ipfsHash = await uploadToIPFS(modifiedPdfBytes);

      const newLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      console.log('Updated document with QR code uploaded to IPFS:', newLink);

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

      {transactionHash && (
        <div>
          <p>Document has been signed!</p>
          <p>Transaction hash: {transactionHash}</p>

          <a
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>

          {qrCodeUrl && (
            <div>
              <h4>QR Code for Etherscan Transaction</h4>
              <img src={qrCodeUrl} alt="QR Code" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignDocument;
