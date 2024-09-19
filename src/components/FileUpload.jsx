import React, { useState } from 'react';
import QRCode from 'qrcode-generator'; // Import the QR code generator
import { PDFDocument } from 'pdf-lib';

const FileUpload = ({ setUploadedFile, transactionHash }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fileArrayBuffer = await file.arrayBuffer(); // Konvertera filen till ArrayBuffer
  
    setSelectedFile(file); // Behåll den ursprungliga filen om den behövs senare
    setUploadedFile(fileArrayBuffer); // Skicka ArrayBuffer istället för hela filen
  };  

  // Generate QR code using the qrcode-generator library
  const generateQRCode = (transactionUrl) => {
    const qr = QRCode(0, 'L'); // Create a QR code with the lowest error correction level (L)
    qr.addData(transactionUrl); // Add the transaction URL as QR code data
    qr.make(); // Generate the QR code
    return qr.createDataURL(); // Return the QR code as a data URL
  };

  // Add QR code to PDF file
  const addQRCodeToPdf = async (pdfBytes, qrCodeDataUrl) => {
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

  // Handle embedding QR code into the PDF
  const handleAddQrCode = async () => {
    setIsProcessing(true);

    try {
      const transactionUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`;
      const qrCodeDataUrl = generateQRCode(transactionUrl); // Generate the QR code

      const pdfBytes = await selectedFile.arrayBuffer(); // Convert the uploaded file to array buffer
      const modifiedPdfBytes = await addQRCodeToPdf(pdfBytes, qrCodeDataUrl); // Embed the QR code in the PDF

      // Create a blob and generate a download link for the modified PDF
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      setFileUrl(downloadUrl); // Set the file URL for downloading
    } catch (error) {
      console.error("Error embedding QR code into PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h3>Upload and Sign Document</h3>
      <input type="file" onChange={handleFileUpload} accept="application/pdf" />

      {selectedFile && transactionHash && (
        <button onClick={handleAddQrCode} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Embed QR Code and Download'}
        </button>
      )}

      {fileUrl && (
        <div>
          <p>Download your signed document with the embedded QR code:</p>
          <a href={fileUrl} download="SignedDocument.pdf">Download Signed Document</a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
