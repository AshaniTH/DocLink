import crypto from "crypto";

// Switch between sandbox and live
const isSandbox = true; // change to false in production

export const payhereConfig = {
  merchant_id:  process.env.PAYHERE_MERCHANT_ID,        // from PayHere Dashboard
  merchant_secret: process.env.PAYHERE_MERCHANT_SECRET, // from PayHere Dashboard
  sandbox: isSandbox,
  checkoutUrl: isSandbox
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout",
  return_url: "https://yourdomain.com/payment/success", // must match domain approved in PayHere
  cancel_url: "https://yourdomain.com/payment/cancel",
  notify_url: "https://your-backend.com/api/payments/notify",
};

/**
 * Generate MD5 hash for payment request
 * Required by PayHere to validate request integrity
 */
export const generateHash = (orderId, amount, currency) => {
  const { merchant_id, merchant_secret } = payhereConfig;

  // First, hash the merchant secret
  const merchantSecretHash = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();

  // Then, hash merchant_id + order_id + amount + currency + hashedSecret
  const hash = crypto
    .createHash("md5")
    .update(`${merchant_id}${orderId}${amount}${currency}${merchantSecretHash}`)
    .digest("hex")
    .toUpperCase();

  return hash;
};

/**
 * Verify payment notification from PayHere
 * Ensures the callback is authentic
 */
export const verifyPayment = (paymentData) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = paymentData;

  const merchantSecretHash = crypto
    .createHash("md5")
    .update(payhereConfig.merchant_secret)
    .digest("hex")
    .toUpperCase();

  const localHash = crypto
    .createHash("md5")
    .update(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${merchantSecretHash}`
    )
    .digest("hex")
    .toUpperCase();

  return localHash === md5sig;
};
