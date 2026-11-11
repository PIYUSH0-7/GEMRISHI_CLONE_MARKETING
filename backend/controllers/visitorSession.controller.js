import { VisitorSession } from "../models/visitorSession.model.js";
import { BlockedIp } from "../models/blockedIp.model.js";

// Helper to extract client IP address
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "";
}

/**
 * Record or update visitor session telemetry (Called via non-blocking beacon/heartbeat)
 */
export async function recordSessionHeartbeat(req, res) {
  try {
    const ip = getClientIp(req);

    // Check if IP is blocked
    const isBlocked = await BlockedIp.findOne({ ip });
    if (isBlocked) {
      return res.status(200).json({ ok: true, ignored: "ip_blocked" });
    }

    const {
      sessionId,
      identifier,
      mobileNumber,
      customerName,
      email,
      device,
      browser,
      city,
      currentUrl,
      pageTitle,
      timeSpentSeconds = 0,
      clicks = [],
      gemstonesViewed = [],
      cartValue = 0,
      orderId = "",
      orderStatus = "",
      utmSource = "",
      utmCampaign = "",
    } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ ok: false, msg: "Missing sessionId" });
    }

    let session = await VisitorSession.findOne({ sessionId });

    if (!session) {
      session = new VisitorSession({
        sessionId,
        identifier: identifier || sessionId,
        ipAddress: ip,
        device: device || "Desktop",
        browser: browser || "",
        city: city || "",
        firstSeen: new Date(),
      });
    }

    // Update IP & basic info
    if (ip && !session.ipAddress) session.ipAddress = ip;
    if (device) session.device = device;
    if (browser) session.browser = browser;
    if (city && !session.city) session.city = city;
    if (cartValue != null) session.cartValue = Number(cartValue);
    if (orderId) session.orderId = orderId;
    if (orderStatus) session.orderStatus = orderStatus;
    if (utmSource && !session.utmSource) session.utmSource = utmSource;
    if (utmCampaign && !session.utmCampaign) session.utmCampaign = utmCampaign;

    // Mobile Number / Identifier conversion
    if (mobileNumber) {
      const cleanDigits = String(mobileNumber).replace(/\D/g, "");
      const formatted = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : mobileNumber;
      session.mobileNumber = formatted;
      session.identifier = formatted;
    }

    if (customerName && !session.customerName) session.customerName = customerName;
    if (email && !session.email) session.email = email;

    // Track pages
    if (currentUrl) {
      session.currentUrl = currentUrl;
      const lastPage = session.pages[session.pages.length - 1];
      if (lastPage && lastPage.url === currentUrl) {
        lastPage.secondsSpent = (lastPage.secondsSpent || 0) + Number(timeSpentSeconds || 5);
      } else {
        session.pages.push({
          url: currentUrl,
          title: pageTitle || "",
          enteredAt: new Date(),
          secondsSpent: Number(timeSpentSeconds || 5),
        });
        if (session.pages.length > 30) session.pages.shift();
      }
    }

    // Append clicks
    if (Array.isArray(clicks) && clicks.length > 0) {
      for (const cl of clicks) {
        if (!cl?.label) continue;
        session.clicks.push({
          label: String(cl.label).slice(0, 60),
          tag: String(cl.tag || "button"),
          time: new Date(),
        });
      }
      if (session.clicks.length > 50) {
        session.clicks = session.clicks.slice(-50);
      }
    }

    // Append viewed gemstones
    if (Array.isArray(gemstonesViewed) && gemstonesViewed.length > 0) {
      for (const g of gemstonesViewed) {
        if (!g?.sku && !g?.name) continue;
        const exists = session.gemstonesViewed.some((gv) => gv.sku === g.sku);
        if (!exists) {
          session.gemstonesViewed.push({
            name: String(g.name || "Gemstone"),
            sku: String(g.sku || ""),
            price: Number(g.price || 0),
          });
        }
      }
    }

    session.lastActive = new Date();
    await session.save();

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: false, error: err.message });
  }
}

/**
 * Convert session ID to mobile number as soon as user types or enters phone number
 */
export async function identifyVisitorSession(req, res) {
  try {
    const { sessionId, phone, mobileNumber, name, email } = req.body || {};
    const rawPhone = phone || mobileNumber;

    if (!sessionId || !rawPhone) {
      return res.status(400).json({ ok: false, msg: "Missing sessionId or phone" });
    }

    const cleanDigits = String(rawPhone).replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      return res.status(200).json({ ok: false, msg: "Phone number too short" });
    }

    const formatted = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : `+${cleanDigits}`;

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      session.identifier = formatted;
      session.mobileNumber = formatted;
      if (name) session.customerName = name;
      if (email) session.email = email;
      session.lastActive = new Date();
      await session.save();
    }

    return res.status(200).json({ ok: true, identifier: formatted });
  } catch (err) {
    return res.status(200).json({ ok: false, error: err.message });
  }
}

/**
 * Block an IP address from tracking
 */
export async function blockIpAddress(req, res) {
  try {
    const ip = req.body?.ip || getClientIp(req);
    const reason = req.body?.reason || "Admin Self-Exclusion";

    if (!ip) {
      return res.status(400).json({ ok: false, msg: "IP required" });
    }

    await BlockedIp.findOneAndUpdate(
      { ip },
      { ip, reason },
      { upsert: true, new: true }
    );

    // Delete existing records from this IP to clean dashboard
    await VisitorSession.deleteMany({ ipAddress: ip });

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/api/v1/analytics/sessions-view?notice=ip_blocked");
    }

    return res.status(200).json({ ok: true, blockedIp: ip });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * Unblock an IP address
 */
export async function unblockIpAddress(req, res) {
  try {
    const ip = req.body?.ip || req.query?.ip;
    if (!ip) {
      return res.status(400).json({ ok: false, msg: "IP required" });
    }

    await BlockedIp.deleteOne({ ip });

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/api/v1/analytics/sessions-view?notice=ip_unblocked");
    }

    return res.status(200).json({ ok: true, unblockedIp: ip });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * HTML Web View Dashboard for User Session Analytics & 1-Click Clarity Video Replays
 * URL: /api/v1/analytics/sessions-view
 */
export async function viewSessionsDashboard(req, res) {
  try {
    const myIp = getClientIp(req);
    const isMyIpBlocked = !!(await BlockedIp.findOne({ ip: myIp }));

    const sessions = await VisitorSession.find().sort({ lastActive: -1 }).limit(100);
    const blockedIps = await BlockedIp.find().sort({ createdAt: -1 });

    const totalSessions = sessions.length;
    const leadsWithPhone = sessions.filter((s) => s.mobileNumber).length;
    const vipSessions = sessions.filter((s) => (s.cartValue || 0) >= 25000 || s.orderId).length;

    const clarityProjectId = "y5uk9ao8cf";

    const rowsHtml = sessions
      .map((s, index) => {
        const d = new Date(s.lastActive || s.updatedAt);
        const timeAgo = formatTimeAgo(d);
        const hasPhone = !!s.mobileNumber;
        const cleanDigits = (s.mobileNumber || "").replace(/\D/g, "");
        const waNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

        // Clarity link: Direct search by identified User ID or session
        const searchTarget = s.mobileNumber || s.identifier || s.sessionId;
        const clarityReplayUrl = `https://clarity.microsoft.com/projects/view/${clarityProjectId}/dashboard?filter=userid:${encodeURIComponent(
          searchTarget.replace(/\s+/g, "")
        )}`;

        // Pages badges
        const pagesList = (s.pages || [])
          .map(
            (p) =>
              `<div style="margin-bottom:3px; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px;" title="${p.url}">
                <span style="background:#e8f5e9; color:#1b5e20; padding:2px 6px; border-radius:4px; font-family:monospace;">${p.url.replace(/^https?:\/\/[^\/]+/, "") || "/"}</span>
                <span style="color:#666; font-size:10px;">(${p.secondsSpent || 5}s)</span>
              </div>`
          )
          .join("");

        // Clicks badges
        const clicksList = (s.clicks || [])
          .slice(-6)
          .map(
            (c) =>
              `<span style="display:inline-block; margin:2px; font-size:10px; background:#fff3e0; color:#e65100; border:1px solid #ffe0b2; padding:2px 6px; border-radius:4px;">${c.label}</span>`
          )
          .join("");

        // Gemstones badges
        const gemsList = (s.gemstonesViewed || [])
          .map(
            (g) =>
              `<div style="font-size:11px; margin-bottom:2px;"><strong style="color:#0f3a2f;">${g.name}</strong> <span style="color:#888;">(₹${(g.price || 0).toLocaleString("en-IN")})</span></div>`
          )
          .join("");

        const cartBadge =
          s.cartValue > 0
            ? `<span style="background:#e0f2f1; color:#004d40; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">₹${s.cartValue.toLocaleString(
                "en-IN"
              )}</span>`
            : `<span style="color:#aaa; font-size:11px;">Empty</span>`;

        const orderBadge = s.orderId
          ? `<div style="margin-top:4px;"><a href="/thank-you?order_id=${s.orderId}" target="_blank" style="background:#4caf50; color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; text-decoration:none;">Order: ${s.orderId}</a></div>`
          : "";

        return `
          <tr style="border-bottom:1px solid #eee; background:${index % 2 === 0 ? "#ffffff" : "#fbfbfb"};">
            <td style="padding:12px 10px; vertical-align:top; font-size:12px; color:#666;">
              ${index + 1}
            </td>

            <!-- VISITOR / PHONE -->
            <td style="padding:12px 10px; vertical-align:top;">
              ${
                hasPhone
                  ? `<div style="font-weight:700; font-size:13px; color:#1b5e20; display:flex; align-items:center; gap:4px;">
                      <span>📱</span> ${s.mobileNumber}
                    </div>
                    ${s.customerName ? `<div style="font-size:11px; color:#555;">${s.customerName}</div>` : ""}
                    <div style="margin-top:6px; display:flex; gap:6px;">
                      <a href="https://wa.me/${waNumber}?text=Hi!%20Thank%20you%20for%20visiting%20GemRishi" target="_blank" style="background:#25D366; color:white; padding:3px 8px; border-radius:4px; font-size:10px; text-decoration:none; font-weight:600;">WhatsApp</a>
                      <a href="tel:+${waNumber}" style="background:#0f3a2f; color:white; padding:3px 8px; border-radius:4px; font-size:10px; text-decoration:none; font-weight:600;">Call</a>
                    </div>`
                  : `<div style="font-family:monospace; font-size:11px; color:#666; background:#f0f0f0; padding:3px 6px; border-radius:4px; display:inline-block;">
                      ${s.sessionId.slice(0, 16)}...
                    </div>
                    <div style="font-size:10px; color:#999; margin-top:3px;">Anonymous Visitor</div>`
              }
            </td>

            <!-- CLARITY VIDEO REPLAY BUTTON -->
            <td style="padding:12px 10px; vertical-align:top; text-align:center;">
              <a href="${clarityReplayUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#0f3a2f; color:#ffffff; padding:7px 12px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none; box-shadow:0 2px 4px rgba(0,0,0,0.1); transition:background 0.2s;">
                ▶ Watch Video Replay
              </a>
              <div style="font-size:9px; color:#888; margin-top:4px;">Clarity ID: ${clarityProjectId}</div>
            </td>

            <!-- PAGES VISITED -->
            <td style="padding:12px 10px; vertical-align:top;">
              ${pagesList || '<span style="color:#aaa; font-size:11px;">No page data</span>'}
            </td>

            <!-- CLICKS & ACTIONS -->
            <td style="padding:12px 10px; vertical-align:top; max-width:200px;">
              ${clicksList || '<span style="color:#aaa; font-size:11px;">None</span>'}
            </td>

            <!-- GEMSTONES VIEWED -->
            <td style="padding:12px 10px; vertical-align:top;">
              ${gemsList || '<span style="color:#aaa; font-size:11px;">None</span>'}
            </td>

            <!-- CART & ORDER -->
            <td style="padding:12px 10px; vertical-align:top;">
              ${cartBadge}
              ${orderBadge}
            </td>

            <!-- DEVICE & IP -->
            <td style="padding:12px 10px; vertical-align:top; font-size:11px;">
              <div><strong>${s.device || "Desktop"}</strong></div>
              <div style="color:#666; font-size:10px;">${s.city || "India"}</div>
              <div style="color:#999; font-size:10px; font-family:monospace; margin-top:3px;">${s.ipAddress || "N/A"}</div>
              <form action="/api/v1/analytics/block-ip" method="POST" style="margin-top:4px;">
                <input type="hidden" name="ip" value="${s.ipAddress}" />
                <button type="submit" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:2px 6px; border-radius:4px; font-size:9px; cursor:pointer;" onclick="return confirm('Block IP ${s.ipAddress}?');">
                  🚫 Block IP
                </button>
              </form>
            </td>

            <!-- LAST ACTIVE -->
            <td style="padding:12px 10px; vertical-align:top; font-size:11px; color:#666; white-space:nowrap;">
              ${timeAgo}
            </td>
          </tr>
        `;
      })
      .join("");

    const blockedIpsList = blockedIps
      .map(
        (b) =>
          `<span style="display:inline-flex; align-items:center; gap:4px; background:#fee2e2; color:#991b1b; padding:3px 8px; border-radius:12px; font-size:11px; margin:2px;">
            ${b.ip}
            <a href="/api/v1/analytics/unblock-ip?ip=${encodeURIComponent(b.ip)}" style="color:#991b1b; font-weight:bold; text-decoration:none; margin-left:4px;" title="Unblock">✕</a>
          </span>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visitor Sessions & Replay Dashboard | GemRishi</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f4f6f8; color: #333; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #0f3a2f; }
          .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
          .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .metric-card { background: #ffffff; padding: 18px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .metric-val { font-size: 28px; font-weight: 800; color: #0f3a2f; }
          .metric-lbl { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
          .ip-bar { background: #ffffff; padding: 14px 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
          .btn-block { background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; }
          .btn-block:hover { background: #b91c1c; }
          .table-container { background: #ffffff; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; min-width: 1000px; }
          th { background: #0f3a2f; color: #ffffff; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
          .search-input { padding: 8px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; width: 260px; outline: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">GemRishi Live Visitor Telemetry & Replay</h1>
            <p class="subtitle">Real-time visitor journeys, clickstreams, and 1-click Microsoft Clarity video replays</p>
          </div>
          <div>
            <input type="text" id="searchInput" class="search-input" placeholder="🔍 Search Phone, Gemstone, or City..." onkeyup="filterTable()" />
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-val">${totalSessions}</div>
            <div class="metric-lbl">Total Sessions</div>
          </div>
          <div class="metric-card">
            <div class="metric-val" style="color:#16a34a;">${leadsWithPhone}</div>
            <div class="metric-lbl">📱 Mobile Leads Identified</div>
          </div>
          <div class="metric-card">
            <div class="metric-val" style="color:#d97706;">${vipSessions}</div>
            <div class="metric-lbl">⭐ VIP Buyers (Cart/Order)</div>
          </div>
          <div class="metric-card">
            <div class="metric-val" style="color:#dc2626;">${blockedIps.length}</div>
            <div class="metric-lbl">🚫 Blocked Developer IPs</div>
          </div>
        </div>

        <div class="ip-bar">
          <div>
            <span style="font-size:13px; font-weight:600;">Your Internet IP: </span>
            <span style="font-family:monospace; background:#f3f4f6; padding:3px 8px; border-radius:4px; font-weight:700;">${myIp || "Unknown"}</span>
            ${
              isMyIpBlocked
                ? '<span style="color:#16a34a; font-weight:bold; margin-left:8px;">✅ Your IP is currently BLOCKED (Excluded from analytics)</span>'
                : '<span style="color:#dc2626; font-size:12px; margin-left:8px;">⚠️ Your IP is active in analytics</span>'
            }
          </div>
          <div>
            ${
              isMyIpBlocked
                ? `<form action="/api/v1/analytics/unblock-ip" method="POST" style="display:inline;">
                    <input type="hidden" name="ip" value="${myIp}" />
                    <button type="submit" style="background:#16a34a; color:white; border:none; padding:8px 14px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">Unblock My IP</button>
                  </form>`
                : `<form action="/api/v1/analytics/block-ip" method="POST" style="display:inline;">
                    <input type="hidden" name="ip" value="${myIp}" />
                    <button type="submit" class="btn-block">🚫 Block My Current IP Now</button>
                  </form>`
            }
          </div>
        </div>

        ${
          blockedIps.length > 0
            ? `<div style="margin-bottom:16px; font-size:12px;"><strong>Currently Blocked IPs:</strong> ${blockedIpsList}</div>`
            : ""
        }

        <div class="table-container">
          <table id="sessionsTable">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                <th style="width:160px;">Visitor / Phone</th>
                <th style="width:170px;">Clarity Video Replay</th>
                <th style="width:240px;">Pages Visited</th>
                <th style="width:180px;">What They Clicked</th>
                <th style="width:170px;">Gemstones Viewed</th>
                <th style="width:100px;">Cart Value</th>
                <th style="width:140px;">Device & IP</th>
                <th style="width:100px;">Last Active</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding:30px; color:#888;">No visitor sessions recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>

        <script>
          function filterTable() {
            const input = document.getElementById("searchInput");
            const filter = input.value.toLowerCase();
            const table = document.getElementById("sessionsTable");
            const tr = table.getElementsByTagName("tr");

            for (let i = 1; i < tr.length; i++) {
              const text = tr[i].textContent || tr[i].innerText;
              if (text.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
              } else {
                tr[i].style.display = "none";
              }
            }
          }
        </script>
      </body>
      </html>
    `;

    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`Error rendering dashboard: ${err.message}`);
  }
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
