// src/services/groupService.js
import Group from "../models/Group.js";

export async function listGroups() {
  return Group.find({ isActive: true }).sort({ code: 1 }).lean();
}

export async function getGroupByCode(code) {
  return Group.findOne({ code: code.toUpperCase(), isActive: true }).lean();
}
