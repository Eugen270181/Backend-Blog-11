import {RequestLogDocument, RequestLogModelType} from "../domain/requestsLog.entity";
import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";

@injectable()
export class RequestsLogsRepository {

    private requestLogModel: RequestLogModelType
    constructor(@inject(DB) private db: DB) {
        this.requestLogModel = db.getModels().RequestLogModel
    }
    async save(requestLogDocument: RequestLogDocument) {
        return !!requestLogDocument.save()
    }

}