import {RequestsLogsRepository} from "../repositories/requestsLogsRepository";
import {IReqLogDto, RequestLog, RequestLogDocument} from "../domain/requestsLog.entity";
import {inject, injectable} from "inversify";

@injectable()
export class RequestsLogsServices {
    constructor(@inject(RequestsLogsRepository) private requestsLogsRepository: RequestsLogsRepository) {}
    async createRequestLog({ ip, url }: IReqLogDto) {
        const newRequestLogDto: IReqLogDto = { ip, url }
        const newRequestLogDocument: RequestLogDocument = RequestLog.createRequestLog(newRequestLogDto)

        return !!this.requestsLogsRepository.save(newRequestLogDocument)
    }

}
