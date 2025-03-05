import {OutputErrorsType} from '../types/outputErrors.type';
import {ResultStatus} from "../types/enum/resultStatus";


export class ResultClass<T=null> {
    public status:ResultStatus; // статусы ответов на запросы - для превращения в http статусы ответа
    public data:T|null; //данные - структура дженерик для передачи в теле ответа
    public errors: OutputErrorsType;         // объект с ключом - Массив ошибок
    constructor(status?:ResultStatus, data?:T) {
        this.status = status??ResultStatus.BadRequest;
        this.data = data??null;
        this.errors = { errorsMessages: [] }; // Инициализируем массив ошибок
    }

    // Метод для добавления ошибки в массив errorsMessages
    addError(message: string, field: string) {
        this.errors?this.errors.errorsMessages.push({ message, field }):null;
    }
}

