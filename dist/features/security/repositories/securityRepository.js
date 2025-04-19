"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityRepository = void 0;
class SecurityRepository {
    db;
    sessionModel;
    constructor(db) {
        this.db = db;
        this.sessionModel = db.getModels().SessionModel;
    }
    async save(sessionDocument) {
        await sessionDocument.save();
    }
    async findSessionById(deviceId) {
        return this.sessionModel.findOne({ deviceId });
    }
    async findActiveSession({ deviceId, userId, lastActiveDate }) {
        return this.sessionModel.findOne({ deviceId, userId, lastActiveDate });
    }
    async deleteSession(deviceId) {
        const result = await this.sessionModel.deleteOne({ deviceId });
        return result.deletedCount > 0;
    }
    async deleteOtherSessions(userId, deviceId) {
        const filter = { userId, deviceId: { $ne: deviceId } };
        const result = await this.sessionModel.deleteMany(filter);
        return result.deletedCount > 0;
    }
}
exports.SecurityRepository = SecurityRepository;
//# sourceMappingURL=securityRepository.js.map