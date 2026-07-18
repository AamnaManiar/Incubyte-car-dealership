import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 📚 INTERVIEW EXPLANATION: Custom Type Extension
// Express's Request type doesn't have a 'user' field by default.
// We extend it here so TypeScript knows about it.
// This is called "Declaration Merging" in TypeScript.
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * JWT Authentication Middleware
 *
 * 📚 INTERVIEW EXPLANATION: What is Middleware?
 * Middleware = a function that runs BETWEEN the HTTP request arriving
 * and your route handler executing. It can:
 *   - Check if user is authenticated (our case)
 *   - Log requests
 *   - Validate request body
 *   - Modify the request/response objects
 *
 * The (req, res, next) signature is the Express middleware pattern.
 * Call next() to pass control to the next middleware or route handler.
 * Call res.status(401).json(...) to reject the request early.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Step 1: Get the token from the Authorization header
  // Headers look like: "Authorization: Bearer eyJhbGc..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  // Step 2: Extract just the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // Step 3: Verify the token using our secret key
    // jwt.verify() will THROW if the token is:
    //   - Tampered with (signature doesn't match)
    //   - Expired
    //   - Malformed
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as { userId: string; role: string };

    // Step 4: Attach user info to the request object
    // Now any route handler can access req.user.userId
    req.user = decoded;

    // Step 5: Pass control to the next function (route handler)
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};
