import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", jobId } = req.body;

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${jobId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET_KEY ||
        process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_SECRET
    )
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Update job status, release payment to freelancer, etc.
    return res.json({ status: "success" });
  } else {
    return res.status(400).json({ status: "failed" });
  }
};