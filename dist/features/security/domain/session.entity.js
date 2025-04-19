"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSchema = exports.Session = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
class Session {
    deviceId;
    userId;
    ip;
    title;
    lastActiveDate;
    expDate;
    static createSessionDocument(sessionDto) {
        const session = new this();
        session.deviceId = sessionDto.deviceId;
        session.userId = sessionDto.userId;
        session.ip = sessionDto.ip;
        session.title = sessionDto.title;
        session.lastActiveDate = sessionDto.lastActiveDate;
        session.expDate = sessionDto.expDate;
        const SessionModel = ioc_1.db.getModels().SessionModel;
        return new SessionModel(session);
    }
    updateSession(updateDto) {
        this.expDate = updateDto.expDate;
        this.lastActiveDate = updateDto.lastActiveDate;
    }
}
exports.Session = Session;
exports.sessionSchema = new mongoose_1.Schema({
    deviceId: { type: String, required: true },
    userId: { type: String, required: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    lastActiveDate: { type: Date, required: true },
    expDate: { type: Date, required: true }
});
exports.sessionSchema.loadClass(Session);
//# sourceMappingURL=session.entity.js.map