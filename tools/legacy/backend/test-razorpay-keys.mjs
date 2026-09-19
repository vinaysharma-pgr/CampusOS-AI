import dotenv from "dotenv";
dotenv.config();

console.log("KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
console.log("KEY_ID prefix:", process.env.RAZORPAY_KEY_ID?.slice(0, 14));
console.log("KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);
console.log("KEY_SECRET length:", process.env.RAZORPAY_KEY_SECRET?.length);

import Razorpay from "razorpay";
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

try {
  const order = await rzp.orders.create({
    amount: 100,
    currency: "INR",
    receipt: "test_" + Date.now(),
  });
  console.log("");
  console.log("✅ Razorpay keys WORK");
  console.log("   Order ID:", order.id);
  console.log("   Amount:", order.amount);
  console.log("   Currency:", order.currency);
} catch (err) {
  console.log("");
  console.log("❌ Razorpay keys FAILED");
  console.log("   Error:", err.error?.description || err.message);
  console.log("   Status:", err.statusCode);
}
