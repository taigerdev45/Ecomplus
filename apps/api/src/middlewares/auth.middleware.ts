import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';
import { UserRole } from '@ecom/types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication requise' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as AuthRequest['user'];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expirée ou invalide' });
  }
};

export const checkRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
};
