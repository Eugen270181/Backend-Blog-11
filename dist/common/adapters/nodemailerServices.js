"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodemailerServices = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../settings/config");
exports.nodemailerServices = {
    async sendEmail(email, content) {
        let transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: config_1.appConfig.EMAIL,
                pass: config_1.appConfig.EMAIL_PASS,
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
};
//# sourceMappingURL=nodemailerServices.js.map