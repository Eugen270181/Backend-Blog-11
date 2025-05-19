import {WithId} from "mongodb"
import {SecurityOutputModel} from "../types/output/securityOutput.model";
import {Session, SessionModelType} from "../domain/session.entity";
import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class SecurityQueryRepository {
    private sessionModel:SessionModelType

    constructor(@inject(TYPES.DB) private db: DB) {
        this.sessionModel = db.getModels().SessionModel
    }
    async getActiveSessionsAndMap(userId?:string):Promise<SecurityOutputModel[]> { // используем этот метод если проверили валидность и существование в бд значения blogid
        const dateNow = new Date();

        const filter = { "expDate":{ $gt:dateNow }, ...(userId && { userId }) }

        const sessions = await this.sessionModel.find(filter).lean()

        return sessions.map(this.map)
    }
    map(session:WithId<Session>):SecurityOutputModel {
        const { ip, title, lastActiveDate, deviceId} = session;//деструктуризация
        return { deviceId, ip, lastActiveDate:lastActiveDate.toISOString(), title  }
    }
}