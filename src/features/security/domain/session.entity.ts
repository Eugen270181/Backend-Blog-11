import {HydratedDocument, Model, Schema} from "mongoose";

import {db} from "../../../ioc";

export interface ITimeSessionDto {
    lastActiveDate: Date,
    expDate: Date
}
export interface ISessionDto extends ITimeSessionDto {
    deviceId: string,
    userId: string,
    ip: string,
    title: string,
}


export class Session {
    deviceId:string
    userId:string
    ip: string
    title: string
    lastActiveDate: Date
    expDate: Date

    static createSessionDocument( sessionDto: ISessionDto ) {
        const session = new this()

        session.deviceId = sessionDto.deviceId
        session.userId = sessionDto.userId
        session.ip = sessionDto.ip
        session.title = sessionDto.title
        session.lastActiveDate = sessionDto.lastActiveDate
        session.expDate = sessionDto.expDate
        
        const SessionModel = db.getModels().SessionModel

        return new SessionModel(session) as SessionDocument
    }
    updateSession( updateDto: ITimeSessionDto ){
        this.expDate = updateDto.expDate
        this.lastActiveDate = updateDto.lastActiveDate
    }
}


export const sessionSchema:Schema<Session> = new Schema<Session>({
    deviceId: { type: String, required: true },
    userId: { type: String, required: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    lastActiveDate: { type: Date, required: true },
    expDate: { type: Date, required: true }
})

sessionSchema.loadClass(Session)

export type SessionModelType = Model<Session>

export type SessionDocument = HydratedDocument<Session>;