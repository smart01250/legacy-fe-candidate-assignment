import toast from 'react-hot-toast';

class ProfessionalToastService {
  private createCustomToast(message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 4000) {
    const icons = {
      success: '✨',
      error: '🚨',
      warning: '⚡',
      info: '💡'
    };

    const colors = {
      success: '#2ed573',
      error: '#ff4757',
      warning: '#ffa502',
      info: '#3742fa'
    };

    return toast(message, {
      icon: icons[type],
      duration,
      style: {
        background: colors[type],
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    });
  }

  private createOTPModal(otpCode: string, email: string) {
    const message = `🔐 Your OTP Code: ${otpCode}\n📧 Sent to: ${email}\n⏰ Expires in 5 minutes`;
    
    return toast(message, {
      duration: 10000,
      style: {
        background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
        color: 'white',
        fontWeight: '600',
        borderRadius: '24px',
        padding: '40px 48px',
        minWidth: '520px',
        minHeight: '280px',
        textAlign: 'center',
        fontSize: '18px',
        boxShadow: '0 25px 50px rgba(162, 155, 254, 0.3), 0 12px 24px rgba(162, 155, 254, 0.2)',
        border: '1px solid rgba(162, 155, 254, 0.4)',
        backdropFilter: 'blur(20px)',
        whiteSpace: 'pre-line',
      },
      position: 'top-center',
    });
  }

  private createMFAModal(mfaCode: string, method: string, email: string) {
    const methodText = method === 'email' ? `📧 ${email}` : `📱 SMS`;
    const message = `🔐 MFA Verification Code: ${mfaCode}\n📱 Method: ${methodText}\n⏰ Expires in 10 minutes`;
    
    return toast(message, {
      duration: 12000,
      style: {
        background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
        color: 'white',
        fontWeight: '600',
        borderRadius: '24px',
        padding: '40px 48px',
        minWidth: '520px',
        minHeight: '280px',
        textAlign: 'center',
        fontSize: '18px',
        boxShadow: '0 25px 50px rgba(253, 121, 168, 0.3), 0 12px 24px rgba(253, 121, 168, 0.2)',
        border: '1px solid rgba(253, 121, 168, 0.4)',
        backdropFilter: 'blur(20px)',
        whiteSpace: 'pre-line',
      },
      position: 'top-center',
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) {
    return this.createCustomToast(message, type, duration);
  }

  showOTPToast(otpCode: string, email: string) {
    return this.createOTPModal(otpCode, email);
  }

  showMFAToast(mfaCode: string, method: string, email: string) {
    return this.createMFAModal(mfaCode, method, email);
  }
}

const professionalToastService = new ProfessionalToastService();

declare global {
  interface Window {
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
    showOTPToast: (otpCode: string, email: string) => void;
    showMFAToast: (mfaCode: string, method: string, email: string) => void;
  }
}

window.showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) => {
  professionalToastService.showToast(message, type, duration);
};

window.showOTPToast = (otpCode: string, email: string) => {
  professionalToastService.showOTPToast(otpCode, email);
};

window.showMFAToast = (mfaCode: string, method: string, email: string) => {
  professionalToastService.showMFAToast(mfaCode, method, email);
};

export default professionalToastService;
