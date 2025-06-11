// === FILE: server.js ===
import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.json());

// ✅ Use your CCAvenue production working key (for www.secure.ccavenue.com)
const workingKey = "474061969193407745E1EEE1F6B67EB9"; // Replace if needed

// 🔐 AES-128-CBC encryption (used by CCAvenue)
function encrypt(plainText, key) {
  const md5Key = crypto.createHash("md5").update(key).digest();
  const iv = Buffer.from([...Array(16).keys()]);
  const cipher = crypto.createCipheriv("aes-128-cbc", md5Key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// 🔓 AES-128-CBC decryption (used for enc_response)
function decrypt(encryptedText, key) {
  const md5Key = crypto.createHash("md5").update(key).digest();
  const iv = Buffer.from([...Array(16).keys()]);
  const decipher = crypto.createDecipheriv("aes-128-cbc", md5Key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// 🔐 Encrypt endpoint — for Postman to get enc_request
app.post("/encrypt", (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body);
    const encRequest = encrypt(jsonData, workingKey);
    res.json({ enc_request: encRequest });
  } catch (err) {
    res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

// 🔓 Decrypt endpoint — use to read enc_response from CCAvenue
app.post("/decrypt", (req, res) => {
  try {
    const decrypted = decrypt(req.body.enc_response, workingKey);
    res.json({ decrypted });
  } catch (err) {
    res.status(500).json({ error: "Decryption failed", details: err.message });
  }
});

// 🌍 Get your IP for CCAvenue whitelisting
app.get("/myip", (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
  res.send(`Your public IP (send this to CCAvenue): ${ip}`);
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ CCAvenue Encrypt API running on port ${PORT}`);
});
