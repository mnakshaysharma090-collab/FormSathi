const express = require("express");
const router = express.Router();

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

router.post("/validate", (req, res) => {
  const data = req.body;
  const errors = [];

  if (!data.document) errors.push("Document type is required");
  if (!data.fullName) errors.push("Full name is required");
  if (!data.dob) errors.push("Date of birth is required");

  if (!data.mobile || !/^\d{10}$/.test(data.mobile)) {
    errors.push("Mobile number must be exactly 10 digits");
  }

  if (!data.email) errors.push("Email is required");
  if (!data.address) errors.push("Address is required");

  if (errors.length > 0) {
    return res.json({ valid: false, errors });
  }

  res.json({ valid: true, message: "Form details are valid" });
});

router.post("/generate", (req, res) => {
  const data = req.body;

  const generatedPath = path.join(__dirname, "../generated");

  if (!fs.existsSync(generatedPath)) {
    fs.mkdirSync(generatedPath);
  }

  const fileName = `filled-form-${Date.now()}.pdf`;
  const filePath = path.join(generatedPath, fileName);

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(22).text("AI Legal Form Assistant", { align: "center" });
  doc.moveDown();

  doc
    .fontSize(16)
    .text(`${data.document || "Government"} Application Form - Demo`, {
      align: "center",
    });

  doc.moveDown(2);

  doc.fontSize(13).text("Applicant Details", { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Document Type: ${data.document || ""}`);
  doc.text(`Full Name: ${data.fullName || ""}`);
  doc.text(`Date of Birth: ${data.dob || ""}`);
  doc.text(`Mobile Number: ${data.mobile || ""}`);
  doc.text(`Email Address: ${data.email || ""}`);
  doc.text(`Address: ${data.address || ""}`);

  doc.moveDown(2);

  doc.fontSize(13).text("Declaration", { underline: true });
  doc.moveDown();

  doc
    .fontSize(12)
    .text(
      "I declare that the above information is correct to the best of my knowledge. This is a demo generated form and must be reviewed before official use.",
    );

  doc.moveDown(3);
  doc.text("Signature: __________________________");
  doc.text("Date: _______________________________");

  doc.end();

  stream.on("finish", () => {
    res.json({
      success: true,
      downloadUrl: `http://localhost:5000/generated/${fileName}`,
    });
  });

  stream.on("error", () => {
    res.json({
      success: false,
      message: "PDF generation failed",
    });
  });
});

module.exports = router;
