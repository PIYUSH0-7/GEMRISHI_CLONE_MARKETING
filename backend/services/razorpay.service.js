//root/services-folder/razorpay.service.js
import axios from "axios";

const client = axios.create({
    baseURL: "https://api.razorpay.com/v1",
    auth: {
        // .env uses RAZOR_PAY_*; the old RAZORPAY_* names never existed, so refunds got 401.
        username: process.env.RAZOR_PAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZOR_PAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET,
    },
    timeout: 15000,
});
// --------------------------Add By Pawan--------------------------------
export async function fetchOrderPayments(razorpayOrderId) {
    const { data } = await client.get(`/orders/${razorpayOrderId}/payments`);
    return data?.items || [];
}

export async function createRefund(paymentId, amountPaise) {
    const body = {};
    if (amountPaise && amountPaise > 0) body.amount = amountPaise;
    const { data } = await client.post(`/payments/${paymentId}/refund`, body);
    return data;
}
// --------------------------End By Pawan--------------------------------
