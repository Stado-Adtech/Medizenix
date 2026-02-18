require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();

// Use memory storage (important for Vercel)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

// Mail transporter using .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// API route
app.post("/api/enquiry", upload.single("file"), async (req, res) => {
  const { name, phone, city, message } = req.body;
  const file = req.file;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: "New Website Enquiry",
      text: `
New Enquiry Received:

Name: ${name}
Phone: ${phone}
City: ${city}

Requirement:
${message}
      `,
      attachments: file
        ? [
            {
              filename: file.originalname,
              content: file.buffer
            }
          ]
        : []
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ success: false, error: "Mail failed" });
  }
});

// Export for Vercel
module.exports = app;
