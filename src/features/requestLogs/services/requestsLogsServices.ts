import {RequestsLogsRepository} from "../repositories/requestsLogsRepository";
import {IReqLogDto, RequestLog, RequestLogDocument} from "../domain/requestsLog.entity";

export class RequestsLogsServices {
    constructor(private requestsLogsRepository: RequestsLogsRepository) {}
    async createRequestLog({ ip, url }: IReqLogDto) {
        const newRequestLogDto: IReqLogDto = { ip, url }
        const newRequestLogDocument: RequestLogDocument = RequestLog.createRequestLog(newRequestLogDto)

        return !!this.requestsLogsRepository.save(newRequestLogDocument)
    }

}
