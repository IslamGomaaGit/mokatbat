import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const logAudit = async (
  req: AuthRequest,
  action: string,
  resource: string,
  resourceId?: number,
  details?: string
) => {
  try {
    await AuditLog.create({
      user_id: req.user?.id || 0,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.get('user-agent'),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

