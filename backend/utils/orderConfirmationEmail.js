import { sendEmail } from "./sendEmails.js";
import { normalizePublicImageUrl } from "./cashfree.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Retailer } from "../models/retailer.model.js";
import { Product } from "../models/product.model.js";
import { Jewelry } from "../models/jewelry.model.js";

/**
 * Generate responsive, email-client safe HTML matching the GemRishi Thank You page
 */
export function generateOrderConfirmationEmailHtml(order) {
  const orderId = order.orderId || "";
  const totalAmount = Number(order.totalAmount || order.onlinePayAmount || 0);

  const customerName =
    (order.address?.fullName && order.address.fullName !== "Valued Customer"
      ? order.address.fullName
      : "") ||
    (order.userId?.fullName && order.userId.fullName !== "Valued Customer"
      ? order.userId.fullName
      : "") ||
    order.address?.fullName ||
    "Valued Customer";

  const customerPhone = order.address?.mobileNo || order.userId?.mobileNo || "";
  const customerEmail =
    order.address?.email ||
    (order.userId?.email && !order.userId.email.includes("@temp.com")
      ? order.userId.email
      : "");

  const addressLine1 = order.address?.addressLine1 || "";
  const addressLine2 = order.address?.addressLine2 || "";
  const city = order.address?.city || "";
  const state = order.address?.state || "";
  const pinCode = order.address?.pinCode || "";
  const country = order.address?.country || "India";

  const items = Array.isArray(order.items) ? order.items : [];
  const paymentMethod = (order.paymentMethod || "Cashfree OCC").toUpperCase();
  const discountAmount = Number(order.discountAmount || 0);
  const subTotal = Number(
    Number(order.subTotal) > totalAmount
      ? order.subTotal
      : totalAmount + discountAmount
  );
  const paidAmount = Number(
    order.paidAmount !== undefined
      ? order.paidAmount
      : (order.paymentStatus === "Completed" ? totalAmount : 0)
  );
  const paymentMode =
    order.paymentMode ||
    (order.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)");

  // Social & Website links
  const websiteUrl = "https://gemrishi.com";
  const whatsappUrl = `https://wa.me/919817975978?text=${encodeURIComponent(
    `Hi GemRishi team, I have a question about my order #${orderId}.`
  )}`;
  const facebookUrl = "https://www.facebook.com/gemrishi";
  const instagramUrl = "https://instagram.com/gemrishi/";
  const youtubeUrl = "https://www.youtube.com/@GemRishi";

  // Build items rows HTML
  const itemsHtml = items
    .map((item, idx) => {
      const title =
        item.title ||
        item.jewelryTitle ||
        item.productId?.name ||
        item.jewelryId?.jewelryName ||
        "GemRishi Jewelry Item";

      const imgSrc = normalizePublicImageUrl(
        item.image ||
          item.jewelryImage ||
          item.productId?.images?.[0] ||
          item.jewelryId?.images?.[0]
      );

      const qty = item.quantity || 1;
      const price = Number(item.itemTotal || 0).toLocaleString("en-IN");

      // Customizations
      let customDetails = "";
      if (item.customization) {
        const parts = [];
        if (item.customization.goldKarat?.karat) {
          parts.push(`Metal: ${item.customization.goldKarat.karat}`);
        } else if (item.customization.goldKarat?.karatType) {
          parts.push(`Metal: ${item.customization.goldKarat.karatType}`);
        }
        if (item.customization.certificate?.certificateType) {
          parts.push(`Cert: ${item.customization.certificate.certificateType}`);
        }
        if (parts.length > 0) {
          customDetails = `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${parts.join(
            " &bull; "
          )}</div>`;
        }
      }

      return `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top; width: 68px;">
          <div style="width: 64px; height: 64px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; overflow: hidden;">
            <img src="${imgSrc}" alt="${title}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
          </div>
        </td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle;">
          <div style="font-size: 14px; font-weight: 600; color: #120213; line-height: 1.35;">${title}</div>
          ${customDetails}
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
            Qty: <strong style="color: #374151;">${qty}</strong>
          </div>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: right; white-space: nowrap;">
          <span style="font-size: 15px; font-weight: 700; color: #120213;">&#8377;${price}</span>
        </td>
      </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f3f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #120213; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f3f2; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Top GemRishi Logo Bar -->
          <tr>
            <td style="background-color: #ffffff; padding: 18px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <a href="${websiteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://gemrishi.com/logo.jpg" alt="GemRishi" style="height: 38px; width: auto; display: block; margin: 0 auto;" />
              </a>
            </td>
          </tr>

          <!-- Hero Strip (Flipkart / GemRishi Green Banner) -->
          <tr>
            <td style="background-color: #214436; padding: 34px 28px 28px 28px; text-align: center; color: #ffffff;">
              <!-- Checkmark circle -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 14px auto;">
                <tr>
                  <td style="width: 54px; height: 54px; background-color: #ffffff; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="Check" width="28" height="28" style="display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>

              <!-- Badge -->
              <div style="display: inline-block; padding: 4px 14px; background-color: rgba(255, 255, 255, 0.18); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #ecfdf5; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 10px;">
                Payment Successful
              </div>

              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.25;">
                Thank You for Your Order!
              </h1>
              <p style="margin: 0 auto; font-size: 14px; color: rgba(236, 253, 245, 0.88); line-height: 1.5; max-width: 480px;">
                Your payment has been processed successfully. We are preparing your order with the highest care and authentic certification.
              </p>

              <!-- Order ID pill -->
              <div style="margin-top: 16px; display: inline-block; padding: 7px 16px; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.24); border-radius: 8px; font-size: 13px; color: #ffffff;">
                <span style="color: rgba(236, 253, 245, 0.82); font-weight: 500;">Order Reference:</span>
                <span style="font-family: monospace, Courier, monospace; font-weight: 700; margin-left: 4px; letter-spacing: 0.5px;">#${orderId}</span>
              </div>
            </td>
          </tr>

          <!-- Order Status Tracker Strip -->
          <tr>
            <td style="padding: 16px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px;">
                <tr>
                  <td align="center" style="width: 25%;">
                    <div style="width: 26px; height: 26px; background-color: #214436; color: #ffffff; border-radius: 50%; font-size: 12px; font-weight: bold; line-height: 26px; text-align: center; margin: 0 auto 4px auto;">&#10003;</div>
                    <div style="font-size: 11px; font-weight: 700; color: #120213;">Confirmed</div>
                  </td>
                  <td align="center" style="width: 25%;">
                    <div style="width: 24px; height: 24px; background-color: #e5e7eb; color: #9ca3af; border-radius: 50%; font-size: 11px; font-weight: bold; line-height: 24px; text-align: center; margin: 0 auto 4px auto;">2</div>
                    <div style="font-size: 11px; color: #6b7280;">Packed</div>
                  </td>
                  <td align="center" style="width: 25%;">
                    <div style="width: 24px; height: 24px; background-color: #e5e7eb; color: #9ca3af; border-radius: 50%; font-size: 11px; font-weight: bold; line-height: 24px; text-align: center; margin: 0 auto 4px auto;">3</div>
                    <div style="font-size: 11px; color: #6b7280;">Shipped</div>
                  </td>
                  <td align="center" style="width: 25%;">
                    <div style="width: 24px; height: 24px; background-color: #e5e7eb; color: #9ca3af; border-radius: 50%; font-size: 11px; font-weight: bold; line-height: 24px; text-align: center; margin: 0 auto 4px auto;">4</div>
                    <div style="font-size: 11px; color: #6b7280;">Delivered</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items in Your Order -->
          <tr>
            <td style="padding: 16px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td colspan="3" style="padding: 12px 16px; background-color: #fafbfb; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 700; color: #120213;">
                    &#128230; Items in Your Order (${items.length})
                  </td>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- WhatsApp Assistance Banner -->
          <tr>
            <td style="padding: 14px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7faf8; border: 1px solid #d1fae5; border-radius: 8px; padding: 14px 16px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 13px; font-weight: 700; color: #065f46;">Need help with your order?</div>
                    <div style="font-size: 12px; color: #047857; margin-top: 2px;">Our gem experts are ready to assist you on WhatsApp.</div>
                  </td>
                  <td align="right" style="vertical-align: middle; padding-left: 10px; white-space: nowrap;">
                    <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #059669; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 6px;">
                      Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Details Card -->
          <tr>
            <td style="padding: 14px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px;">
                <tr>
                  <td style="font-size: 14px; font-weight: 700; color: #120213; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6;">
                    &#128205; Delivery Details
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <div style="font-size: 15px; font-weight: 700; color: #120213;">${customerName}</div>
                    ${
                      customerPhone
                        ? `<div style="font-size: 13px; color: #4b5563; margin-top: 3px;">&#128222; ${customerPhone}</div>`
                        : ""
                    }
                    ${
                      customerEmail
                        ? `<div style="font-size: 13px; color: #4b5563; margin-top: 2px;">&#9993; ${customerEmail}</div>`
                        : ""
                    }

                    <!-- Shipping Address Box -->
                    <div style="margin-top: 12px; background-color: #f6f8f7; border: 1px solid #eef1f0; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.5; color: #374151;">
                      <div style="font-weight: 700; color: #120213; margin-bottom: 4px;">Shipping Address:</div>
                      ${
                        addressLine1
                          ? `
                        <div>${addressLine1}</div>
                        ${addressLine2 ? `<div>${addressLine2}</div>` : ""}
                        <div>${city}${state ? `, ${state}` : ""}${
                              pinCode ? ` - ${pinCode}` : ""
                            }</div>
                        <div>${country}</div>
                      `
                          : `<div style="color: #6b7280; font-style: italic;">Address collected via Cashfree OCC</div>`
                      }
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Details Card -->
          <tr>
            <td style="padding: 14px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px;">
                <tr>
                  <td colspan="2" style="font-size: 14px; font-weight: 700; color: #120213; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6;">
                    &#128179; Order & Payment Details
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #6b7280;">Subtotal (Price before discount)</td>
                  <td align="right" style="padding-top: 12px; font-size: 13px; font-weight: 600; color: #120213;">
                    &#8377;${subTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                ${
                  discountAmount > 0
                    ? `
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #047857; font-weight: 600;">Discount</td>
                  <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #047857;">
                    - &#8377;${discountAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #6b7280;">Total Order Amount</td>
                  <td align="right" style="padding-top: 8px; font-size: 14px; font-weight: 700; color: #120213;">
                    &#8377;${totalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #6b7280;">Mode of Payment</td>
                  <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #120213;">
                    ${paymentMode}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #6b7280;">Payment Status</td>
                  <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #047857;">
                    Payment Verified (Completed)
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px; border-top: 1px dashed #e5e7eb; font-size: 14px; font-weight: 700; color: #120213;">
                    Total Amount Paid
                  </td>
                  <td align="right" style="padding-top: 14px; border-top: 1px dashed #e5e7eb; font-size: 17px; font-weight: 800; color: #214436;">
                    &#8377;${paidAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                ${
                  discountAmount > 0
                    ? `
                <tr>
                  <td colspan="2" style="padding-top: 10px;">
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #065f46; text-align: center;">
                      &#127881; You saved &#8377;${discountAmount.toLocaleString("en-IN")} on this order!
                    </div>
                  </td>
                </tr>
                `
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Social Icons & Website Row (In place of Go to Homepage) -->
          <tr>
            <td style="padding: 24px 20px 20px 20px; text-align: center; border-top: 1px solid #f0f0f0; margin-top: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: #214436; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 14px;">
                Connect With GemRishi
              </div>

              <!-- 5 Social / Web Icons with Links -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <!-- 1. Website -->
                  <td align="center" style="padding: 0 10px;">
                    <a href="${websiteUrl}" target="_blank" style="text-decoration: none; color: #374151; font-size: 11px; font-weight: 600; display: inline-block;">
                      <div style="width: 44px; height: 44px; background-color: #f3f4f6; border-radius: 50%; text-align: center; margin: 0 auto 6px auto;">
                        <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Website" width="22" height="22" style="margin-top: 11px; display: inline-block;" />
                      </div>
                      Website
                    </a>
                  </td>

                  <!-- 2. WhatsApp -->
                  <td align="center" style="padding: 0 10px;">
                    <a href="${whatsappUrl}" target="_blank" style="text-decoration: none; color: #374151; font-size: 11px; font-weight: 600; display: inline-block;">
                      <div style="width: 44px; height: 44px; background-color: #ecfdf5; border-radius: 50%; text-align: center; margin: 0 auto 6px auto;">
                        <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" alt="WhatsApp" width="22" height="22" style="margin-top: 11px; display: inline-block;" />
                      </div>
                      WhatsApp
                    </a>
                  </td>

                  <!-- 3. Facebook -->
                  <td align="center" style="padding: 0 10px;">
                    <a href="${facebookUrl}" target="_blank" style="text-decoration: none; color: #374151; font-size: 11px; font-weight: 600; display: inline-block;">
                      <div style="width: 44px; height: 44px; background-color: #eff6ff; border-radius: 50%; text-align: center; margin: 0 auto 6px auto;">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="22" height="22" style="margin-top: 11px; display: inline-block;" />
                      </div>
                      Facebook
                    </a>
                  </td>

                  <!-- 4. Instagram -->
                  <td align="center" style="padding: 0 10px;">
                    <a href="${instagramUrl}" target="_blank" style="text-decoration: none; color: #374151; font-size: 11px; font-weight: 600; display: inline-block;">
                      <div style="width: 44px; height: 44px; background-color: #fdf2f8; border-radius: 50%; text-align: center; margin: 0 auto 6px auto;">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="22" height="22" style="margin-top: 11px; display: inline-block;" />
                      </div>
                      Instagram
                    </a>
                  </td>

                  <!-- 5. YouTube -->
                  <td align="center" style="padding: 0 10px;">
                    <a href="${youtubeUrl}" target="_blank" style="text-decoration: none; color: #374151; font-size: 11px; font-weight: 600; display: inline-block;">
                      <div style="width: 44px; height: 44px; background-color: #fef2f2; border-radius: 50%; text-align: center; margin: 0 auto 6px auto;">
                        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" width="22" height="22" style="margin-top: 11px; display: inline-block;" />
                      </div>
                      YouTube
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal & Copyright -->
          <tr>
            <td style="background-color: #214436; padding: 20px 24px; text-align: center; color: rgba(236, 253, 245, 0.75); font-size: 11px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 4px;">
                GemRishi &bull; Certified Natural Gemstones & Fine Jewellery
              </div>
              <div>Venture by Fateh Chand Bansi Lal Jewellers Private Limited</div>
              <div style="margin-top: 6px;">
                For any queries, write to us at <a href="mailto:orders@gemrishi.com" style="color: #a7f3d0; text-decoration: underline;">orders@gemrishi.com</a> or WhatsApp <a href="https://wa.me/919817975978" style="color: #a7f3d0; text-decoration: underline;">+91 9817975978</a>.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch post-order confirmation email ONLY when payment is completed
 */
export async function sendOrderConfirmationEmail(orderInput) {
  try {
    if (!orderInput) return false;

    let order = orderInput;
    const orderIdToLookup = typeof order === "string" ? order : order._id;

    if (orderIdToLookup && (!order.items || !order.address || typeof order.populate === "function")) {
      const fresh = await Order.findById(orderIdToLookup)
        .populate("userId retailerId")
        .populate("items.productId", "name images price slug sku")
        .populate("items.jewelryId", "jewelryName images price slug sku")
        .populate({
          path: "items.customization.jewelryId",
          select: "jewelryName images price slug sku",
          strictPopulate: false,
        })
        .populate({
          path: "items.customization.productId",
          select: "name images price slug sku",
          strictPopulate: false,
        });
      if (fresh) order = fresh;
    }

    // STRICT CHECK: Mail must only go after successful payment
    if (order.paymentStatus !== "Completed") {
      console.log(
        `Confirmation email skipped for order ${order.orderId}: paymentStatus is "${order.paymentStatus}" (not Completed).`
      );
      return false;
    }

    // AVOID DUPLICATE EMAILS
    if (order.confirmationEmailSent) {
      console.log(
        `Confirmation email already sent for order ${order.orderId}. Skipping.`
      );
      return true;
    }

    const recipientEmail =
      order.address?.email ||
      (order.userId?.email &&
      !order.userId.email.includes("@temp.com") &&
      !order.userId.email.startsWith("guest_")
        ? order.userId.email
        : null) ||
      order.retailerId?.email;

    if (!recipientEmail) {
      console.warn(
        `No valid customer email found for order ${order.orderId}. Confirmation email skipped.`
      );
      return false;
    }

    const html = generateOrderConfirmationEmailHtml(order);

    await sendEmail({
      to: recipientEmail,
      subject: `Order Confirmation - #${order.orderId}`,
      html,
    });

    await Order.updateOne(
      { _id: order._id },
      { $set: { confirmationEmailSent: true } }
    );
    order.confirmationEmailSent = true;

    console.log(
      `✅ Post-order confirmation email successfully sent to ${recipientEmail} for order ${order.orderId}`
    );
    return true;
  } catch (error) {
    console.error(
      `Failed to send order confirmation email for order ${
        orderInput?.orderId || orderInput
      }:`,
      error.message
    );
    return false;
  }
}
