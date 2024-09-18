import React, { useState } from 'react';
import { pinata } from '../utilities/config'; // Adjust the path to your config

const UploadToIPFS = ({ file, setIpfsHash }) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFileToPinata = async () => {
    setIsUploading(true);
    try {
      const upload = await pinata.upload.file(file);
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
        {isUploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>
    </div>
  );
};

export default UploadToIPFS;
