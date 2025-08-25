import request from 'supertest';
import { app } from '../index';
import { ethers } from 'ethers';

describe('POST /api/verify-signature', () => {
  let wallet: ethers.Wallet;
  let testMessage: string;
  let validSignature: string;

  beforeAll(async () => {
    wallet = ethers.Wallet.createRandom();
    testMessage = 'Test message for API';
    validSignature = await wallet.signMessage(testMessage);
  });

  it('should verify a valid signature', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        message: testMessage,
        signature: validSignature,
      })
      .expect(200);

    expect(response.body).toEqual({
      isValid: true,
      signer: wallet.address.toLowerCase(),
      originalMessage: testMessage,
    });
  });

  it('should reject invalid signature', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        message: testMessage,
        signature: '0x' + '0'.repeat(130),
      })
      .expect(200);

    expect(response.body).toEqual({
      isValid: false,
      signer: null,
      originalMessage: testMessage,
    });
  });

  it('should return 400 for missing message', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        signature: validSignature,
      })
      .expect(400);

    expect(response.body.error).toContain('Message is required');
  });

  it('should return 400 for missing signature', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        message: testMessage,
      })
      .expect(400);

    expect(response.body.error).toContain('Signature is required');
  });

  it('should return 400 for empty message', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        message: '',
        signature: validSignature,
      })
      .expect(400);

    expect(response.body.error).toContain('Message is required');
  });

  it('should trim whitespace from inputs', async () => {
    const response = await request(app)
      .post('/api/verify-signature')
      .send({
        message: `  ${testMessage}  `,
        signature: `  ${validSignature}  `,
      })
      .expect(200);

    expect(response.body.isValid).toBe(true);
    expect(response.body.originalMessage).toBe(testMessage);
  });
});
