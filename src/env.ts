// Runtime environment variables for AWS Amplify SSR
// This file exposes environment variables at runtime instead of build time

function getEnvVar(name: string, defaultValue: string = ''): string {
  // Try process.env first (works in build time and some runtime contexts)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  
  // Try window.__ENV__ for client-side (set by server)
  if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[name]) {
    return (window as any).__ENV__[name];
  }
  
  return defaultValue;
}

export const env = {
  DATABASE_URL: getEnvVar('DATABASE_URL', ''),
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', ''),
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL', ''),
  AUTH_SECRET: getEnvVar('AUTH_SECRET', ''),
  AUTH_URL: getEnvVar('AUTH_URL', ''),
  AUTH_TRUST_HOST: getEnvVar('AUTH_TRUST_HOST', 'true'),
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', ''),
  NEXT_PUBLIC_APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'NaaS Marketplace'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', ''),
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID', ''),
  RAZORPAY_KEY_SECRET: getEnvVar('RAZORPAY_KEY_SECRET', ''),
  SMTP_HOST: getEnvVar('SMTP_HOST', ''),
  SMTP_PORT: getEnvVar('SMTP_PORT', ''),
  SMTP_USER: getEnvVar('SMTP_USER', ''),
  SMTP_PASS: getEnvVar('SMTP_PASS', ''),
  SMTP_FROM_EMAIL: getEnvVar('SMTP_FROM_EMAIL', ''),
  SMTP_FROM_NAME: getEnvVar('SMTP_FROM_NAME', ''),
};

export default env;
