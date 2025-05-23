import { IReqLogQuery, RequestLogModelType, SelReqLogFilter } from "../domain/requestsLog.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class RequestsLogsQueryRepository {

    constructor(@inject(TYPES.RequestLogModel) private requestLogModel: RequestLogModelType
    ) {}
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