import express from "express";
import axios from "axios";
import qs from "querystring";
const router = express.Router();

const CLIENT_ID = "ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep";
const CLIENT_SECRET = "E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17";
const REDIRECT_URI = "https://workspace--tyson44.replit.app/api/qbo/callback";
const ENVIRONMENT = "sandbox";

const AUTH_BASE = ENVIRONMENT === "sandbox"
  ? "https://appcenter.intuit.com"
  : "https://accounts.intuit.com";

router.get("/auth", (req, res) => {
  console.log("QuickBooks OAuth auth route accessed");
  const scope = "com.intuit.quickbooks.accounting";
  const state = "yobot_secure_state_" + Date.now();
  const url = `${AUTH_BASE}/connect/oauth2?client_id=${CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
  
  console.log("Redirecting to QuickBooks:", url);
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  console.log("QuickBooks callback received");
  const { code, realmId, state } = req.query;
  
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const tokenRes = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    
    console.log("✅ QuickBooks OAuth Success!");
    console.log("Access Token:", access_token.substring(0, 20) + "...");
    console.log("Refresh Token:", refresh_token.substring(0, 20) + "...");
    console.log("Realm ID:", realmId);
    console.log("Expires in:", expires_in, "seconds");

    res.json({
      status: "success",
      message: "QuickBooks connected successfully!",
      realmId,
      expiresIn: expires_in,
      instructions: [
        "Add these environment variables to your Replit Secrets:",
        `QUICKBOOKS_ACCESS_TOKEN=${access_token}`,
        `QUICKBOOKS_REFRESH_TOKEN=${refresh_token}`,
        `QUICKBOOKS_REALM_ID=${realmId}`
      ]
    });

  } catch (err) {
    console.error("❌ QuickBooks OAuth Failed:", err.response?.data || err.message);
    res.status(500).json({
      status: "error",
      message: "OAuth token exchange failed",
      error: err.response?.data || err.message
    });
  }
});

export default router;