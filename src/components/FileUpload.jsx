import React, { useState } from 'react';
import { pinata } from '../utilities/pinataConfig';

const FileUpload = ({ setUploadedFile, transactionHash, setIpfsHash, setIsUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fileArrayBuffer = await file.arrayBuffer(); // Convert file to ArrayBuffer
  
    setSelectedFile(file); // Keep the original file if needed later
    setUploadedFile(fileArrayBuffer); // Send ArrayBuffer instead of the entire file
  };

  // Handle file upload to Pinata
  const uploadFileToPinata = async (fileBuffer) => {
    setIsUploading(true);
    try {
      const modifiedFile = new File([fileBuffer], selectedFile.name, { type: selectedFile.type });
      const upload = await pinata.upload.file(modifiedFile);
      console.log('File uploaded to IPFS with hash:', upload.IpfsHash);
      setIpfsHash(upload.IpfsHash);
      setIsUploaded(true);
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file processing and URL generation
  const handleAddFile = async () => {
    setIsProcessing(true);
    try {
      const pdfBytes = await selectedFile.arrayBuffer(); // Convert uploaded file to array buffer
      // Upload the file to IPFS
      await uploadFileToPinata(pdfBytes);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h3>Upload Document</h3>
      <input type="file" onChange={handleFileUpload} accept="application/pdf" />

      {selectedFile && (
        <button onClick={handleAddFile} disabled={isProcessing || isUploading}>
          {isProcessing || isUploading ? 'Processing...' : 'Upload Document'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
