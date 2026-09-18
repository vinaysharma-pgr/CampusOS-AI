// src/services/userService.js
import User from "../models/User.js";

export async function listUsersByRole(role) {
  const query = { isActive: true };
  if (role) query.role = role;
  return User.find(query)
    .select("_id name email role department")
    .sort({ name: 1 })
    .lean();
}
