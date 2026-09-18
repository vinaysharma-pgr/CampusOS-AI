// src/services/pushService.js
import webpush from "web-push";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import PushSubscription from "../models/PushSubscription.js";

// Configure VAPID once at startup
if (env.vapid?.publicKey && env.vapid?.privateKey) {
  webpush.setVapidDetails(
    env.vapid.subject,
    env.vapid.publicKey,
    env.vapid.privateKey
  );
  console.log("🔔 Push service configured");
} else {
  console.warn("⚠️  VAPID keys missing — push notifications disabled");
}

// In-memory fallback when MongoDB isn't connected
const memorySubs = new Map(); // userId → [sub, ...]

const usingMongo = () => process.env.USE_MONGO === "true" && mongoose.connection.readyState === 1;

export const pushService = {
  async addSubscription(userId, subscription, userAgent = "") {
    if (!userId || !subscription?.endpoint) return;

    if (usingMongo()) {
      try {
        await PushSubscription.findOneAndUpdate(
          { endpoint: subscription.endpoint },
          {
            userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            userAgent,
            isActive: true,
          },
          { upsert: true, new: true }
        );
        console.log(`🔔 Subscription saved (MongoDB) for user ${userId}`);
      } catch (err) {
        console.error("❌ Failed to save subscription:", err.message);
      }
    } else {
      // In-memory fallback
      const list = memorySubs.get(userId) || [];
      if (!list.find((s) => s.endpoint === subscription.endpoint)) {
        list.push(subscription);
        memorySubs.set(userId, list);
      }
      console.log(`🔔 Subscription saved (memory) for user ${userId}`);
    }
  },

  async removeSubscription(userId, endpoint) {
    if (usingMongo()) {
      await PushSubscription.deleteOne({ endpoint }).catch(() => {});
    } else {
      const list = memorySubs.get(userId) || [];
      memorySubs.set(userId, list.filter((s) => s.endpoint !== endpoint));
    }
  },

  async notifyUsers(userIds, payload) {
    if (!env.vapid?.publicKey) return { sent: 0 };

    let subs = [];

    if (usingMongo()) {
      const userObjectIds = userIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      const rawIds = userIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));

      subs = await PushSubscription.find({
        isActive: true,
        $or: [
          { userId: { $in: userObjectIds } },
          { userId: { $in: rawIds } },
        ],
      }).lean();
    } else {
      for (const userId of userIds) {
        const list = memorySubs.get(userId) || [];
        subs.push(...list);
      }
    }

    if (subs.length === 0) {
      console.log(`🔔 No subscriptions found for ${userIds.length} user(s)`);
      return { sent: 0 };
    }

    const stringified = JSON.stringify(payload);
    let sent = 0;
    const errors = [];

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            stringified
          );
          sent++;
        } catch (err) {
          // Clean up dead subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint }).catch(() => {});
          } else {
            errors.push(`${err.statusCode}: ${err.message}`);
          }
        }
      })
    );

    if (errors.length) console.error("Push errors:", errors.slice(0, 3));
    console.log(`🔔 Push sent: ${sent} notification(s)`);
    return { sent };
  },

  async getSubscriptionCount() {
    if (usingMongo()) {
      return PushSubscription.countDocuments({ isActive: true });
    }
    let total = 0;
    for (const list of memorySubs.values()) total += list.length;
    return total;
  },
};
