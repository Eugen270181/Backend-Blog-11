import {RequestLogDocument, RequestLogModelType} from "../domain/requestsLog.entity";
import {DB} from "../../../common/module/db/DB";

export class RequestsLogsRepository {

    private requestLogModel: RequestLogModelType
    constructor(private db: DB) {
        this.requestLogModel = db.getModels().RequestLogModel
    }
    async save(requestLogDocument: RequestLogDocument) {
        return !!requestLogDocument.save()
    }

}