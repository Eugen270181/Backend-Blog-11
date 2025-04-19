"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultClass = void 0;
const resultStatus_1 = require("../types/enum/resultStatus");
class ResultClass {
    status; // статусы ответов на запросы - для превращения в http статусы ответа
    data; //данные - структура дженерик для передачи в теле ответа
    errors; // объект с ключом - Массив ошибок
    constructor(status, data) {
        this.status = status ?? resultStatus_1.ResultStatus.BadRequest;
        this.data = data ?? null;
        this.errors = { errorsMessages: [] }; // Инициализируем массив ошибок
    }
    // Метод для добавления ошибки в массив errorsMessages
    addError(message, field) {
        this.errors ? this.errors.errorsMessages.push({ message, field }) : null;
    }
}
exports.ResultClass = ResultClass;
//# sourceMappingURL=result.class.js.map