import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw new Error('Failed to generate QR Code');
  }
};
