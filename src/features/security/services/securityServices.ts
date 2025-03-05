import {SecurityRepository} from "../repositories/securityRepository";
import {ISessionDto, ITimeSessionDto, Session, SessionDocument} from "../domain/session.entity";


export class SecurityServices {
    constructor(private securityRepository:SecurityRepository) {}
    async createSession(sessionDto:ISessionDto) {
        const newSessionDocument:SessionDocument = Session.createSessionDocument(sessionDto)

        await this.securityRepository.save(newSessionDocument)

        return newSessionDocument.id
    }
    async deleteSession(deviceId:string){
        const foundSessionDocument: SessionDocument | null = await this.securityRepository.findSessionById(deviceId);
        if (!foundSessionDocument) return false;

        return this.securityRepository.deleteSession( deviceId )
    }
    async deleteOtherSessions(userId: string, deviceId: string){
        return this.securityRepository.deleteOtherSessions(userId, deviceId)
    }
    async updateSession({ lastActiveDate, expDate }:ITimeSessionDto, deviceId:string ) {
        const foundSessionDocument: SessionDocument | null = await this.securityRepository.findSessionById(deviceId);
        if (!foundSessionDocument) return false;

        foundSessionDocument.updateSession({lastActiveDate, expDate})

        await this.securityRepository.save(foundSessionDocument)

        return true
    }
}