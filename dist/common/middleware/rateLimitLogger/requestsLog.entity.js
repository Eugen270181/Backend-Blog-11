"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestsLogSchema = exports.RequestsLog = void 0;
const mongoose_1 = require("mongoose");
class RequestsLog {
    ip;
    url;
    date;
}
exports.RequestsLog = RequestsLog;
exports.requestsLogSchema = new mongoose_1.Schema({
    ip: { type: String, require: true },
    url: { type: String, require: true },
    date: { type: Date, require: true },
});
//# sourceMappingURL=requestsLog.entity.js.map