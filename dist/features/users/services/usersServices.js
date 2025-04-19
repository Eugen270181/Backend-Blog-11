"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersServices = void 0;
const hashServices_1 = require("../../../common/adapters/hashServices");
const result_class_1 = require("../../../common/classes/result.class");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const user_entity_1 = require("../domain/user.entity");
class UsersServices {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async createUser(user) {
        const result = new result_class_1.ResultClass();
        const { login, password, email } = user;
        if (await this.usersRepository.findUserByLogin(login)) {
            result.addError("not unique field!", "login");
            return result;
        }
        if (await this.usersRepository.findUserByEmail(email)) {
            result.addError("not unique field!", "email");
            return result;
        }
        const passwordHash = await hashServices_1.hashServices.getHash(password);
        const newUserDto = { login, email, hash: passwordHash };
        const newUserDocument = user_entity_1.User.createUserBySa(newUserDto);
        await this.usersRepository.save(newUserDocument);
        result.status = resultStatus_1.ResultStatus.Created;
        result.data = newUserDocument.id;
        return result;
    }
    async deleteUser(id) {
        const foundUserDocument = await this.usersRepository.findUserById(id);
        if (!foundUserDocument)
            return false;
        return this.usersRepository.deleteUserById(id);
    }
    async activateConfirmation(id) {
        const foundUserDocument = await this.usersRepository.findUserById(id);
        if (!foundUserDocument)
            return false;
        foundUserDocument.activateConfirmation();
        await this.usersRepository.save(foundUserDocument);
        return true;
    }
    async updatePassHash(id, passwordHash) {
        const foundUserDocument = await this.usersRepository.findUserById(id);
        if (!foundUserDocument)
            return false;
        foundUserDocument.updatePassHash(passwordHash);
        await this.usersRepository.save(foundUserDocument);
        return true;
    }
    async setRegConfirmationCode(id, code, date) {
        const foundUserDocument = await this.usersRepository.findUserById(id);
        if (!foundUserDocument)
            return false;
        foundUserDocument.setRegConfirmationCode(code, date);
        await this.usersRepository.save(foundUserDocument);
        return true;
    }
    async setPassConfirmationCode(id, code, date) {
        const foundUserDocument = await this.usersRepository.findUserById(id);
        if (!foundUserDocument)
            return false;
        foundUserDocument.setPassConfirmationCode(code, date);
        await this.usersRepository.save(foundUserDocument);
        return true;
    }
}
exports.UsersServices = UsersServices;
//# sourceMappingURL=usersServices.js.map