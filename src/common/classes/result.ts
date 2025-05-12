import {OutputErrorsType} from '../types/outputErrors.type';
import {ResultStatus} from "../types/enum/resultStatus";


export class Result<T=null> {
    status: ResultStatus; // статусы ответов на запросы - для превращения в http статусы ответа
    data: T|null=null; //данные - структура дженерик для передачи в теле ответа
    errors: OutputErrorsType = { errorsMessages: [] };         // объект с ключом - Массив ошибок

    static createSuccess<T=null>(data?:T){
        const result = new Result<T>()

        result.status = ResultStatus.Success
        result.data = data??null

        return result
    }
    static createErrors(status: ResultStatus, message?: string, field?: string ) {
        const result = new Result()

        result.status = status
        if(message && field) {result.addError(message, field)}

        return result
    }
    // Метод для добавления ошибки в массив errorsMessages
    addError(message: string, field: string) {
        this.errors.errorsMessages.push({ message, field });
    }
}


