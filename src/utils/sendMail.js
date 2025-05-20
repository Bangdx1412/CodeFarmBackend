import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USERNAME } from "../configs/enviroments.js";

export const sendEmail = async (email, subject, html) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: EMAIL_USERNAME,
				pass: EMAIL_PASSWORD,
			},
		});

		const mailOptions = {
			from: EMAIL_USERNAME,
			to: email,
			subject: subject,
			html: html,
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error("Error sending email: " + error.message);
	}
};
