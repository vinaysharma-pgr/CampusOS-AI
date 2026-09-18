import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../database/index.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieName = (await import("../config/env.js")).env.cookie.name;
    const cookieToken = req.cookies?.[cookieName];
    const token = bearer || cookieToken;
    if (!token) throw ApiError.unauthorized("No token provided");
    const decoded = verifyToken(token);
    const user = await db.findUserById(decoded.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("User not found or inactive");
    const { password: _, ...safe } = user;
    req.user = safe;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden(`Requires role: ${roles.join(" or ")}`));
    next();
  };
}