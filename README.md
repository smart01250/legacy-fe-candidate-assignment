
# Web3 Message Signer & Verifier

A full-stack Web3 application that allows users to authenticate with Dynamic.xyz embedded wallets, sign custom messages, and verify signatures through a secure backend API.

## 🚀 Live Demo

**[Try the Live Application](https://web3-message-signer-verifier-app.vercel.app)**

Experience the full Web3 message signing and verification workflow with real Dynamic.xyz authentication and cryptographic signature validation.

## 🏗️ Architecture

### Frontend (React 18 + TypeScript + Vite)
- **Dynamic.xyz Headless Authentication**: Email-based embedded wallet authentication
- **Message Signing Interface**: Clean, intuitive UI for message input and signing
- **Real-time Verification**: Instant signature verification with backend API
- **Persistent History**: Local storage of signed messages with verification status
- **Responsive Design**: Beautiful, mobile-friendly UI with Tailwind CSS

### Backend (Node.js + Express + TypeScript)
- **REST API**: Secure signature verification endpoint
- **Ethers.js Integration**: Cryptographic signature validation
- **Error Handling**: Comprehensive error handling and validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Health Monitoring**: Built-in health check endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Dynamic.xyz Environment ID (see setup instructions below)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd "Web3 Message Signer & Verifier"
npm run install:all
```

2. **Configure environment variables:**

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed (default PORT=3001)
```

**Frontend (.env):**
```bash
cp frontend/.env.example frontend/.env
# Add your Dynamic.xyz Environment ID:
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id_here
```

3. **Start the application:**
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

4. **Access the applications:**
- **Main Overview**: http://localhost:3000/
- **React App with Dynamic.xyz**: http://localhost:3000/react-app.html
- **Backend API Demo**: http://localhost:3000/demo.html

## 🔧 Dynamic.xyz Setup

1. **Create a Dynamic.xyz account** at [https://app.dynamic.xyz](https://app.dynamic.xyz)
2. **Create a new project** and select "Embedded Wallets"
3. **Configure settings:**
   - Enable Email authentication
   - Add `http://localhost:3000` to allowed origins
   - Copy your Environment ID
4. **Update frontend/.env** with your Environment ID

## 📋 API Documentation

### POST /api/verify-signature

Verifies a cryptographic signature against a message.

**Request:**
```json
{
  "message": "Hello, Web3 World!",
  "signature": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "isValid": true,
  "signer": "0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2",
  "originalMessage": "Hello, Web3 World!"
}
```

**Error Response:**
```json
{
  "error": "Invalid signature format",
  "details": "Signature must be a valid hex string"
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Individual Test Suites
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend
```

### Test Coverage
- **Backend**: Signature verification logic, API endpoints, error handling
- **Frontend**: Storage utilities, API service, component rendering

## 🏗️ Project Structure

```
Web3 Message Signer & Verifier/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AuthenticationFlow.tsx
│   │   │   ├── MessageSigner.tsx
│   │   │   ├── MessageHistory.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── types/           # TypeScript types
│   │   └── __tests__/       # Test files
│   └── package.json
└── package.json            # Root package.json for workspace
```

## 🎨 Features

### ✅ Core Requirements
- [x] Dynamic.xyz headless email authentication
- [x] Custom message signing interface
- [x] Backend signature verification with ethers.js
- [x] Message history with localStorage persistence
- [x] Beautiful, responsive UI design
- [x] Comprehensive error handling
- [x] TypeScript throughout
- [x] Test suite coverage

### 🌟 Additional Features
- [x] Real-time signature verification
- [x] Copy-to-clipboard functionality
- [x] Loading states and user feedback
- [x] Error boundary for crash protection
- [x] Health check endpoints
- [x] Modular, scalable architecture
- [x] Mobile-responsive design
- [x] Accessibility considerations

## 🔒 Security Considerations

- **Input Validation**: All inputs are validated on both frontend and backend
- **CORS Configuration**: Properly configured for development and production
- **Error Handling**: Sensitive information is not exposed in error messages
- **Signature Verification**: Uses industry-standard ethers.js for cryptographic operations
- **Environment Variables**: Sensitive configuration is externalized

## 🚀 Deployment

### Live Production Deployment
**Application URL**: https://web3-message-signer-verifier-app.vercel.app

This application is deployed as a single repository on Vercel with:
- **Frontend**: React app built and served as static files
- **Backend**: Express API endpoints converted to Vercel serverless functions
- **Database**: Client-side storage using localStorage

### Vercel Deployment Configuration
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### Environment Variables (Vercel)
- `DYNAMIC_ENVIRONMENT_ID`: Dynamic.xyz environment ID
- `DYNAMIC_API_KEY`: Dynamic.xyz API key for authentication
- `NODE_ENV`: Set to `production`

## 🔄 Trade-offs and Future Improvements

### Current Trade-offs
1. **In-Memory State**: Backend uses in-memory state (no database)
2. **Local Storage**: Frontend persists data in localStorage only
3. **Single Environment**: Configured for single Dynamic.xyz environment

### Future Improvements
1. **Database Integration**: Add PostgreSQL/MongoDB for persistent storage
2. **Multi-Factor Authentication**: Implement Dynamic.xyz MFA
3. **Message Categories**: Add support for different message types
4. **User Profiles**: Extended user management and profiles
5. **Batch Operations**: Support for signing multiple messages at once
6. **Advanced Analytics**: Message signing analytics and insights
7. **Mobile App**: React Native version for mobile platforms

## 🛠️ Development

### Available Scripts
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build           # Build both applications
npm run test            # Run all tests
npm run install:all     # Install all dependencies
```

### Code Quality
- **ESLint**: Configured for TypeScript and React
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Jest/Vitest**: Testing frameworks

## 📞 Support

For questions or issues:
1. Check the troubleshooting section below
2. Review Dynamic.xyz documentation
3. Open an issue in the repository

## 🔧 Troubleshooting

### Common Issues

**Dynamic.xyz Authentication Fails:**
- Verify your Environment ID is correct
- Check that localhost:3000 is in allowed origins
- Ensure email authentication is enabled

**Backend Connection Issues:**
- Verify backend is running on port 3001
- Check CORS configuration
- Ensure .env files are properly configured

**Build/Test Issues:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all environment variables are set

---

Built with ❤️ using React, TypeScript, Node.js, and Dynamic.xyz



