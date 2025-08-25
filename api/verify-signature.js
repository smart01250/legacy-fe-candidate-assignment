import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, signature } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    if (!signature || typeof signature !== 'string' || signature.trim().length === 0) {
      return res.status(400).json({ error: 'Signature is required and must be a non-empty string' });
    }

    let recoveredAddress;
    let isValid = false;

    try {
      let formattedSignature = signature.trim();
      if (!formattedSignature.startsWith('0x')) {
        formattedSignature = '0x' + formattedSignature;
      }

      if (!/^0x[0-9a-fA-F]{130}$/.test(formattedSignature)) {
        throw new Error('Invalid signature format');
      }

      recoveredAddress = ethers.verifyMessage(message.trim(), formattedSignature);
      isValid = true;
    } catch (error) {
      recoveredAddress = null;
      isValid = false;
    }

    const response = {
      isValid,
      signer: isValid ? recoveredAddress.toLowerCase() : null,
      originalMessage: message.trim(),
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
