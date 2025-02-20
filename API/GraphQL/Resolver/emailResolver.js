const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_EMAIL_PASSWORD,
  },
});

const emailresolvers = {
  Mutation: {
    sendInvoiceEmail: async (_, { invoice, pdfBase64 }) => {
      try {
        if (!invoice) throw new Error("Invoice data is required");

        if (!invoice.user || !invoice.user.email)
          throw new Error("Invalid user email");

        const pdfBuffer = Buffer.from(pdfBase64, "base64");

        const mailOptions = {
          from: process.env.USER_EMAIL,
          to: invoice.user.email,
          subject: `Invoice #${invoice.id}`,
          text: `Dear ${
            invoice.user.firstname
          },\n\nPlease find your invoice attached.\n\nTotal Amount: $${invoice.finalTotal.toFixed(
            2
          )}\n\nThank you for your purchase!`,
          attachments: [
            {
              filename: `Invoice_${invoice.id}.pdf`,
              content: pdfBuffer,
            },
          ],
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error("Error sending email:", error);
          }
        });
        return true;
      } catch (error) {
        console.error("Error sending invoice email:", error);
        return false;
      }
    },
  },
};

module.exports = emailresolvers;
