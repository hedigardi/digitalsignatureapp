import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import FileUpload from './components/FileUpload';
import SignDocument from './components/SignDocument';
import VerifyDocument from './components/VerifyDocument';
import './App.css';

const App = () => {
  const [account, setAccount] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  return (
    <div>
      <h1>Digital Signature Platform</h1>
      <ConnectWallet setAccount={setAccount} />

      {account && (
        <>
          <FileUpload 
            setUploadedFile={setUploadedFile} 
            transactionHash={transactionHash} 
            setIpfsHash={setIpfsHash} 
            setIsUploaded={setIsUploaded} 
          />
          {isUploaded && (
            <SignDocument fileBuffer={uploadedFile} setTransactionHash={setTransactionHash} />
          )}
          <VerifyDocument />
        </>
      )}
    </div>
  );
};

export default App;