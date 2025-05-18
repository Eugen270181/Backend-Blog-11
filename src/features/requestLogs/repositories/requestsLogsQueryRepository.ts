import { IReqLogQuery, RequestLogModelType, SelReqLogFilter } from "../domain/requestsLog.entity";
import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";

@injectable()
export class RequestsLogsQueryRepository {

    private requestLogModel: RequestLogModelType
    constructor(@inject(DB) private db: DB) {
        this.requestLogModel = db.getModels().RequestLogModel
    }
    async requestsCounter(reqLogQuery: IReqLogQuery):Promise<number> {
        const filter = this.mapRegLogDtoToFilter(reqLogQuery)

        return this.requestLogModel.countDocuments(filter)
    }
    async getRequests(reqLogQuery: IReqLogQuery) {
        const filter = this.mapRegLogDtoToFilter(reqLogQuery)

        console.log(await this.requestLogModel.find(filter))
    }
    mapRegLogDtoToFilter({ ip, url, date }: IReqLogQuery):SelReqLogFilter{
        return {
            ip: ip,
            url: url,
            createdAt: {$gte: date}
        }
    }

}