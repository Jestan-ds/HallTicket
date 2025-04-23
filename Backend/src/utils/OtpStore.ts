const otpStore: { [key: string]: { otp: string; expiresAt: number } } = {};

export const saveOTP = (email: string, otp: string) => {
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // Expires in 5 minutes
  };
};

export const verifyOTP = (email: string, otp: string): boolean => {
  const entry = otpStore[email];

  if (!entry || entry.otp !== otp) return false;
  if (Date.now() > entry.expiresAt) {
    delete otpStore[email]; // Remove expired OTP
    return false;
  }

  delete otpStore[email]; // Remove OTP after successful verification
  return true;
};
