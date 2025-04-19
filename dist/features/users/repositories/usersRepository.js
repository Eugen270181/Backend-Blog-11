"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
class UsersRepository {
    db;
    userModel;
    constructor(db) {
        this.db = db;
        this.userModel = db.getModels().UserModel;
    }
    async save(userDocument) {
        await userDocument.save();
    }
    async deleteUserById(_id) {
        const result = await this.userModel.deleteOne({ _id });
        return result.deletedCount > 0;
    }
    async findUserById(_id) {
        return this.userModel.findById(_id).catch(() => null);
    }
    async findByLoginOrEmail(inputLogin) {
        const search = { $or: [{ login: inputLogin }, { email: inputLogin }] };
        return this.userModel.findOne(search);
    }
    async findUserByLogin(login) {
        return this.userModel.findOne({ login });
    }
    async findUserByEmail(email) {
        return this.userModel.findOne({ email });
    }
    async findUserByRegConfirmCode(code) {
        return this.userModel.findOne({ 'emailConfirmation.confirmationCode': code });
    }
    async findUserByPassConfirmCode(code) {
        return this.userModel.findOne({ 'passConfirmation.confirmationCode': code });
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=usersRepository.js.map