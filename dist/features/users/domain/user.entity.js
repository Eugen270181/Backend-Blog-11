"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.User = void 0;
const add_1 = require("date-fns/add");
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
const randomCodeServices_1 = require("../../../common/adapters/randomCodeServices");
class User {
    login;
    email;
    passwordHash;
    createdAt;
    isConfirmed;
    emailConfirmation;
    passConfirmation;
    static createUserBySa({ login, email, hash }) {
        const user = new this();
        user.login = login;
        user.email = email;
        user.passwordHash = hash;
        user.createdAt = new Date();
        const userModel = ioc_1.db.getModels().UserModel;
        return new userModel(user);
    }
    static createUserByReg({ login, email, hash }) {
        const userDocument = this.createUserBySa({ login, email, hash });
        userDocument.isConfirmed = false;
        userDocument.emailConfirmation = {
            confirmationCode: randomCodeServices_1.RandomCodeServices.genRandomCode(),
            expirationDate: (0, add_1.add)(new Date(), { hours: 1, minutes: 30 })
        };
        return userDocument;
    }
    activateConfirmation() {
        this.isConfirmed = true;
    }
    updatePassHash(passwordHash) {
        this.passwordHash = passwordHash;
    }
    setRegConfirmationCode(code, date) {
        this.emailConfirmation = {
            confirmationCode: code,
            expirationDate: date
        };
    }
    setPassConfirmationCode(code, date) {
        this.passConfirmation = {
            confirmationCode: code,
            expirationDate: date
        };
    }
}
exports.User = User;
////////////////////////////////////////////////////////////////
const emailConfirmationSchema = new mongoose_1.Schema({
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
}, { _id: false });
const passConfirmationSchema = new mongoose_1.Schema({
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
}, { _id: false });
exports.userSchema = new mongoose_1.Schema({
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true, default: true },
    emailConfirmation: { type: emailConfirmationSchema, nullable: true, default: null },
    passConfirmation: { type: passConfirmationSchema, nullable: true, default: null },
});
exports.userSchema.loadClass(User);
//# sourceMappingURL=user.entity.js.map