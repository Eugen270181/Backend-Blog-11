"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtServices = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtServices = {
    async createToken(userId, secretKey, expirationTime, deviceId) {
        return jsonwebtoken_1.default.sign(deviceId ? { userId, deviceId } : { userId }, secretKey, {
            expiresIn: expirationTime,
        });
    },
    async decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (e) {
            console.error("Can't decode token", e);
            return null;
        }
    },
    async verifyToken(token, secretKey) {
        try {
            return jsonwebtoken_1.default.verify(token, secretKey);
        }
        catch (error) {
            console.error("Token verify some error");
            return null;
        }
    },
};
//# sourceMappingURL=jwtServices.js.map