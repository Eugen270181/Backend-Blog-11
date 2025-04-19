"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityServices = void 0;
const session_entity_1 = require("../domain/session.entity");
class SecurityServices {
    securityRepository;
    constructor(securityRepository) {
        this.securityRepository = securityRepository;
    }
    async createSession(sessionDto) {
        const newSessionDocument = session_entity_1.Session.createSessionDocument(sessionDto);
        await this.securityRepository.save(newSessionDocument);
        return newSessionDocument.id;
    }
    async deleteSession(deviceId) {
        const foundSessionDocument = await this.securityRepository.findSessionById(deviceId);
        if (!foundSessionDocument)
            return false;
        return this.securityRepository.deleteSession(deviceId);
    }
    async deleteOtherSessions(userId, deviceId) {
        return this.securityRepository.deleteOtherSessions(userId, deviceId);
    }
    async updateSession({ lastActiveDate, expDate }, deviceId) {
        const foundSessionDocument = await this.securityRepository.findSessionById(deviceId);
        if (!foundSessionDocument)
            return false;
        foundSessionDocument.updateSession({ lastActiveDate, expDate });
        await this.securityRepository.save(foundSessionDocument);
        return true;
    }
}
exports.SecurityServices = SecurityServices;
//# sourceMappingURL=securityServices.js.map