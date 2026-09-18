import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";

export async function listFacilities({ type, q } = {}) {
  let items = await db.listFacilities();
  if (type && type !== "all") items = items.filter((f) => f.type === type);
  if (q) {
    const lower = q.toLowerCase();
    items = items.filter(
      (f) => f.name.toLowerCase().includes(lower) || f.code.toLowerCase().includes(lower) || (f.tagline || "").toLowerCase().includes(lower)
    );
  }
  return items;
}
export async function getFacility(id) {
  const f = await db.getFacilityById(id);
  if (!f) throw ApiError.notFound("Facility not found");
  return f;
}
export async function createFacility(data, userId) {
  try {
    return await db.createFacility({ ...data, createdBy: userId });
  } catch (err) {
    if (err.message?.includes("already exists")) throw ApiError.conflict(err.message);
    throw err;
  }
}
export async function updateFacility(id, updates) {
  const f = await db.updateFacility(id, updates);
  if (!f) throw ApiError.notFound("Facility not found");
  return f;
}
export async function deleteFacility(id) {
  const ok = await db.deleteFacility(id);
  if (!ok) throw ApiError.notFound("Facility not found");
  return { deleted: true };
}