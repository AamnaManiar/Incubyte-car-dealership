import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Admin-Only Middleware
 *
 * 📚 INTERVIEW EXPLANATION:
 * This middleware runs AFTER authenticate middleware.
 * It checks if the logged-in user has the "ADMIN" role.
 *
 * Usage in routes:
 *   router.delete('/:id', authenticate, adminOnly, deleteVehicle)
 *   //                    ^^^^^^^^^    ^^^^^^^^^
 *   //                    1st check    2nd check
 *   //                    (logged in?) (is admin?)
 *
 * This is called "Role-Based Access Control" (RBAC).
 */
export const adminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      // 403 = Forbidden (you're authenticated, but not authorized)
      // vs 401 = Unauthorized (not logged in at all)
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  next();
};
