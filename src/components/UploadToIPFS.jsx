import React, { useState } from 'react';
import { pinata } from '../utilities/config';
import { embedQRCodeIntoPDF } from '../utilities/pdfModifier';

const UploadToIPFS = ({ fileBuffer, setIpfsHash, transactionHash }) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFileToPinata = async () => {
    setIsUploading(true);
    try {
      const modifiedFile = new File([fileBuffer], `signed_document_${transactionHash}.pdf`, { type: 'application/pdf' });
      const upload = await pinata.upload.file(modifiedFile);
      console.log('File uploaded to IPFS with hash:', upload.IpfsHash);
      setIpfsHash(upload.IpfsHash);
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <button onClick={uploadFileToPinata} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
};

export default UploadToIPFS;
