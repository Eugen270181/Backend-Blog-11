"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.hashServices = {
    async getHash(password, saltRounds) {
        const saltRound = saltRounds ? saltRounds : 10;
        return bcrypt_1.default.hash(password, saltRound);
    },
    async checkHash(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    },
};
//# sourceMappingURL=hashServices.js.map