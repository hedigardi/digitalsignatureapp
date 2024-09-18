import React, { useState } from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import FileUpload from './components/FileUpload';
import SignDocument from './components/SignDocument';
import UploadToIPFS from './components/UploadToIPFS';

const App = () => {
  const [account, setAccount] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  const ipfsUrl = ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : null;

  return (
    <div className="App">
      <h1>Digital Signature Platform</h1>

      <ConnectWallet setAccount={setAccount} />

      {account ? (
        <>
          {!uploadedFile ? (
            <FileUpload setUploadedFile={setUploadedFile} />
          ) : (
            <p>Fil vald: {uploadedFile.name}</p>
          )}

          {uploadedFile && !ipfsHash && (
            <UploadToIPFS file={uploadedFile} setIpfsHash={setIpfsHash} />
          )}

          {ipfsHash && !transactionHash && (
            <SignDocument fileHash={ipfsHash} setTransactionHash={setTransactionHash} />
          )}

          {ipfsHash && transactionHash && (
            <div>
              <h3>Signerad Dokument</h3>
              <p>Ladda ner det signerade dokumentet från IPFS:</p>
              <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                {ipfsUrl}
              </a>
            </div>
          )}
        </>
      ) : (
        <p>Vänligen anslut din plånbok för att ladda upp filer.</p>
      )}
    </div>
  );
};

export default App;
