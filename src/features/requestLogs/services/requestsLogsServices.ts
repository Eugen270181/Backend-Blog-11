import {RequestsLogsRepository} from "../repositories/requestsLogsRepository";
import {IReqLogDto, RequestLog, RequestLogDocument} from "../domain/requestsLog.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class RequestsLogsServices {
    constructor(@inject(TYPES.RequestsLogsRepository) private requestsLogsRepository: RequestsLogsRepository) {}
    async createRequestLog({ ip, url }: IReqLogDto) {
        const newRequestLogDto: IReqLogDto = { ip, url }
        const newRequestLogDocument: RequestLogDocument = RequestLog.createRequestLog(newRequestLogDto)

        return !!this.requestsLogsRepository.save(newRequestLogDocument)
    }

}
