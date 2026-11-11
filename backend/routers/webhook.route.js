import express from "express";
import crypto from "crypto";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const router = express.Router();
const LOG_FILE = "/www/wwwroot/GemRishi/deploy.log";
const DEPLOY_SCRIPT = "/www/wwwroot/GemRishi/scripts/deploy.sh";

// Default fallback secret (can be overridden via DEPLOY_WEBHOOK_SECRET in .env)
const DEFAULT_SECRET = "gemrishi_auto_deploy_2026";

function verifySignature(req) {
  const secret = process.env.DEPLOY_WEBHOOK_SECRET || DEFAULT_SECRET;
  
  // 1. Check query token or custom header
  const token = req.query.token || req.headers["x-deploy-token"];
  if (token && token === secret) {
    return true;
  }

  // 2. Check GitHub HMAC signature (X-Hub-Signature-256)
  const signature = req.headers["x-hub-signature-256"];
  if (signature) {
    const candidates = [];
    if (req.rawBody) {
      candidates.push(req.rawBody);
    }
    if (req.body) {
      candidates.push(JSON.stringify(req.body));
    }

    for (const payload of candidates) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = `sha256=${hmac.update(payload).digest("hex")}`;
      const sigBuf = Buffer.from(signature);
      const digBuf = Buffer.from(digest);
      if (sigBuf.length === digBuf.length && crypto.timingSafeEqual(sigBuf, digBuf)) {
        return true;
      }
    }
    console.warn("[Webhook] Signature verification failed against secret.");
    return false;
  }

  console.warn("[Webhook] No signature header (X-Hub-Signature-256) or token provided.");
  return false;
}

// GitHub Webhook & Manual Trigger Endpoint
router.post("/github-deploy", (req, res) => {
  const event = req.headers["x-github-event"];

  // Ping event from GitHub Webhook UI test
  if (event === "ping") {
    return res.status(200).json({ success: true, message: "Webhook ping received successfully!" });
  }

  // Verify secret token or signature
  if (!verifySignature(req)) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid webhook secret or signature" });
  }

  // Check branch if it's a GitHub push event
  if (event === "push") {
    const ref = req.body?.ref;
    if (ref && ref !== "refs/heads/main") {
      return res.status(200).json({
        success: true,
        message: `Ignored push to branch ${ref}. Auto-deploy only listens to refs/heads/main.`
      });
    }
  }

  // Spawn deploy script detached in the background
  try {
    const isForce = req.query.force === "true" || req.body?.force === true;
    const args = isForce ? [DEPLOY_SCRIPT, "--force"] : [DEPLOY_SCRIPT];
    const child = spawn("/bin/bash", args, {
      detached: true,
      stdio: "ignore"
    });
    child.unref();

    return res.status(200).json({
      success: true,
      message: `Deployment initiated successfully in the background${isForce ? " (force rebuild)" : ""}.`,
      checkStatusAt: "/api/v1/webhook/deploy-status"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to trigger deploy script", error: err.message });
  }
});

// View recent deploy logs
router.get("/deploy-status", (req, res) => {
  if (!fs.existsSync(LOG_FILE)) {
    return res.status(200).json({ success: true, message: "No deployments recorded yet." });
  }

  try {
    const logContent = fs.readFileSync(LOG_FILE, "utf-8");
    const lines = logContent.split("\n");
    const count = parseInt(req.query.lines, 10) || 150;
    const recentLines = lines.slice(-count).join("\n");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send(recentLines);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error reading deploy log", error: err.message });
  }
});

export default router;
