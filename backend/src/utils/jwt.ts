import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as string | number,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as string | number,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { userId: number } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
};

