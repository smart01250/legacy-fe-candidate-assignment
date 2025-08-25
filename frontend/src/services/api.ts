import axios from 'axios';
import { VerificationResult, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const verifySignature = async (
  message: string,
  signature: string
): Promise<VerificationResult> => {
  try {
    const response = await api.post<VerificationResult>('/verify-signature', {
      message,
      signature,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = error.response?.data || { error: 'Network error' };
      throw new Error(apiError.error);
    }
    throw new Error('Unknown error occurred');
  }
};

export default api;
