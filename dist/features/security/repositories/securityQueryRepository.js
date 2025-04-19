"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQueryRepository = void 0;
class SecurityQueryRepository {
    db;
    sessionModel;
    constructor(db) {
        this.db = db;
        this.sessionModel = db.getModels().SessionModel;
    }
    async getActiveSessionsAndMap(userId) {
        const dateNow = new Date();
        const filter = { "expDate": { $gt: dateNow }, ...(userId && { userId }) };
        const sessions = await this.sessionModel.find(filter).lean();
        return sessions.map(this.map);
    }
    map(session) {
        const { ip, title, lastActiveDate, deviceId } = session; //деструктуризация
        return { deviceId, ip, lastActiveDate: lastActiveDate.toISOString(), title };
    }
}
exports.SecurityQueryRepository = SecurityQueryRepository;
//# sourceMappingURL=securityQueryRepository.js.map