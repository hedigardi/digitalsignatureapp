import { PDFDocument } from 'pdf-lib';

export async function embedQRCodeIntoPDF(pdfBytes, qrCodeData) {
  if (pdfBytes.length < 100) {
    console.error('Invalid PDF: File too small');
    console.log('PDF bytes length:', pdfBytes.length);
    return pdfBytes;
  }
  try {
    console.log('PDF bytes length:', pdfBytes.length);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const qrImage = await pdfDoc.embedPng(qrCodeData);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawImage(qrImage, {
      x: firstPage.getWidth() - 100,
      y: 20,
      width: 80,
      height: 80,
    });
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error embedding QR code:', error);
    console.log('First 100 bytes of PDF:', pdfBytes.slice(0, 100));
    return pdfBytes;
  }
}