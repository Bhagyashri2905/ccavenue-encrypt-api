// === FILE: server.js ===

import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.json());

// Replace with your correct working key for CCAvenue
const workingKey = "474061969193407745E1EEE1F6B67EB9";

function encrypt(text, key) {
  const md5Key = crypto.createHash("md5").update(key).digest();
  const iv = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const cipher = crypto.createCipheriv("aes-128-cbc", md5Key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

app.post("/encrypt", (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body);
    const encRequest = encrypt(jsonData, workingKey);
    res.json({ encRequest });
  } catch (err) {
    res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ CCAvenue Encrypt API running on Render/Localhost port 3000");
});
