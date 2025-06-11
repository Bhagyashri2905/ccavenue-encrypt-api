// === FILE: server.js ===
import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.json());

const workingKey = "474061969193407745E1EEE1F6B67EB9"; // Replace with your real CCAvenue working key

function encrypt(plainText, key) {
  const md5Key = crypto.createHash("md5").update(key).digest();
  const iv = Buffer.from([...Array(16).keys()]);
  const cipher = crypto.createCipheriv("aes-128-cbc", md5Key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText, key) {
  const md5Key = crypto.createHash("md5").update(key).digest();
  const iv = Buffer.from([...Array(16).keys()]);
  const decipher = crypto.createDecipheriv("aes-128-cbc", md5Key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.post("/encrypt", (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body);
    const encRequest = encrypt(jsonData, workingKey);
    res.json({ enc_request: encRequest });
  } catch (err) {
    res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

// Optional: For decrypting enc_response from CCAvenue
app.post("/decrypt", (req, res) => {
  try {
    const decrypted = decrypt(req.body.enc_response, workingKey);
    res.json({ decrypted });
  } catch (err) {
    res.status(500).json({ error: "Decryption failed", details: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ CCAvenue Encrypt API running on port 3000");
});
