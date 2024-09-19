import React, { useState, useEffect } from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import FileUpload from './components/FileUpload';
import SignDocument from './components/SignDocument';
import UploadToIPFS from './components/UploadToIPFS';
import VerifyDocument from './components/VerifyDocument'; // Importera VerifyDocument
import { generateQRCode } from './utilities/qrCodeGenerator';

const App = () => {
  const [account, setAccount] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [signedFileBuffer, setSignedFileBuffer] = useState(null);

  const ipfsUrl = ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : null;

  useEffect(() => {
    if (transactionHash) {
      generateQRCode(`https://sepolia.etherscan.io/tx/${transactionHash}`)
        .then(setQrCodeData)
        .catch(console.error);
    }
  }, [transactionHash]);

  return (
    <div className="App">
      <h1>Digital Signature Platform</h1>

      {/* Step 1: Connect Wallet */}
      <ConnectWallet setAccount={setAccount} />

      {account ? (
        <>
          {/* Step 2: Upload file */}
          {!uploadedFile ? (
            <FileUpload setUploadedFile={setUploadedFile} />
          ) : (
            <p>File selected: {uploadedFile.name}</p>
          )}

          {/* Step 3: Upload original file to IPFS */}
          {uploadedFile && !ipfsHash && (
            <UploadToIPFS
              fileBuffer={uploadedFile} // Ensure that the original file is uploaded here
              setIpfsHash={setIpfsHash}
              transactionHash={null} // No transaction hash yet
            />
          )}

          {/* Step 4: Sign the document after the file is uploaded to IPFS */}
          {ipfsHash && !transactionHash && (
            <SignDocument 
              fileBuffer={uploadedFile} // Sign the original file
              setTransactionHash={setTransactionHash}
              setSignedFileBuffer={setSignedFileBuffer} // Capture the signed file
            />
          )}

          {/* Step 5: Upload the signed file with QR code to IPFS */}
          {transactionHash && signedFileBuffer && (
            <UploadToIPFS 
              fileBuffer={signedFileBuffer} // Upload the signed file
              setIpfsHash={setIpfsHash}
              transactionHash={transactionHash} // Now pass the transaction hash
            />
          )}

          {/* Step 6: Show the link to the signed file on IPFS */}
          {ipfsHash && transactionHash && (
            <div>
              <h3>Signed Document</h3>
              <p>Download the signed document from IPFS:</p>
              <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                {ipfsUrl}
              </a>
            </div>
          )}

          {/* Step 7: Verify Document */}
          <VerifyDocument />
        </>
      ) : (
        <p>Please connect your wallet to upload files.</p>
      )}
    </div>
  );
};

export default App;
