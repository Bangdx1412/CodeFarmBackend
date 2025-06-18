import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: "" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Contact = mongoose.model("Contact", contactSchema, "contacts");

export default Contact;