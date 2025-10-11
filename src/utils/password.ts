export const calculatePasswordStrength = (password: string): {
  strength: number;
  label: string;
  color: string;
} => {
  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  let label = 'WEAK';
  let color = 'text-red-500';

  if (strength >= 80) {
    label = 'STRONG';
    color = 'text-green-500';
  } else if (strength >= 60) {
    label = 'GOOD';
    color = 'text-yellow-500';
  } else if (strength >= 40) {
    label = 'FAIR';
    color = 'text-orange-500';
  }

  return { strength, label, color };
};

export const generatePassword = (length: number = 16): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};
