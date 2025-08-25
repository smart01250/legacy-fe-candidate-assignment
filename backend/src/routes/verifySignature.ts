import { Router, Request, Response, NextFunction } from 'express';
import { SignatureService } from '../services/signatureService';
import { VerifySignatureRequest, VerifySignatureResponse } from '../types';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Validation middleware
const validateSignatureRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message, signature } = req.body as VerifySignatureRequest;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw createError('Message is required and must be a non-empty string', 400);
  }

  if (!signature || typeof signature !== 'string' || signature.trim().length === 0) {
    throw createError('Signature is required and must be a non-empty string', 400);
  }

  // Trim whitespace
  req.body.message = message.trim();
  req.body.signature = signature.trim();

  next();
};

// POST /api/verify-signature
router.post('/verify-signature', validateSignatureRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, signature } = req.body as VerifySignatureRequest;

    console.log(`Verifying signature for message: "${message}"`);

    // Verify the signature
    const verificationResult = await SignatureService.verifySignature(message, signature);

    const response: VerifySignatureResponse = {
      isValid: verificationResult.isValid,
      signer: verificationResult.signer,
      originalMessage: message,
    };

    console.log(`Verification result:`, response);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export { router as verifySignatureRouter };
