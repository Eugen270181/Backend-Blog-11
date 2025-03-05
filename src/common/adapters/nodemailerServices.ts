import nodemailer from "nodemailer";
import { appConfig } from "../settings/config";
import {emailExamples} from "./emailExamples";


export const nodemailerServices = {

    async sendEmail(email: string, content: string ): Promise<boolean> {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: appConfig.EMAIL,
                pass: appConfig.EMAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: '"Kek 👻" <codeSender>',
            to: email,
            subject: "Your code is here",
            html: content, // html body
        });

        return !!info;

    }
}