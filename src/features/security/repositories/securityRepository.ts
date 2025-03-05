import {SessionFindType} from "../../../common/types/sessionFind.type";
import {SessionDocument, SessionModelType} from "../domain/session.entity";
import {db} from "../../../ioc";
import {PostModelType} from "../../posts/domain/post.entity";
import {DB} from "../../../common/module/db/DB";



export class SecurityRepository {
    private sessionModel:SessionModelType

    constructor(private db: DB) {
        this.sessionModel = db.getModels().SessionModel
    }
    async save(sessionDocument: SessionDocument):Promise<void> {
        await sessionDocument.save();
    }
    async findSessionById(deviceId: string):Promise< SessionDocument | null > {
        return this.sessionModel.findOne({ deviceId })
    }
    async findActiveSession( { deviceId, userId, lastActiveDate }: SessionFindType) {
        return this.sessionModel.findOne({ deviceId, userId, lastActiveDate })
    }
    async deleteSession(deviceId:string){
        const result = await this.sessionModel.deleteOne({deviceId});
        return result.deletedCount > 0
    }
    async deleteOtherSessions(userId:string, deviceId:string){
        const filter ={ userId,  deviceId: { $ne: deviceId } }
        const result = await this.sessionModel.deleteMany(filter);
        return result.deletedCount > 0
    }
}