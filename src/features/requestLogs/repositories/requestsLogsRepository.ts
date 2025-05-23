import {RequestLogDocument} from "../domain/requestsLog.entity";
import {injectable} from "inversify";

@injectable()
export class RequestsLogsRepository {

    async save(requestLogDocument: RequestLogDocument) {
        return !!requestLogDocument.save()
    }

}