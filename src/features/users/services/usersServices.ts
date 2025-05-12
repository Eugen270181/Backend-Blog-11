import {UsersRepository} from "../repositories/usersRepository";
import {CreateUserInputModel} from "../types/input/createUserInput.type";
import {hashServices} from "../../../common/adapters/hashServices";
import {Result} from '../../../common/classes/result';
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {IUserDto, User, UserDocument} from "../domain/user.entity";


export class UsersServices {
    constructor(private usersRepository: UsersRepository) {}
    async createUser(user: CreateUserInputModel) {
        const result = new Result<string>()
        const {login, password, email} = user

        if (await this.usersRepository.findUserByLogin(login)) {
            result.addError("not unique field!", "login")
            return result
        }
        if (await this.usersRepository.findUserByEmail(email)) {
            result.addError("not unique field!", "email")
            return result
        }

        const passwordHash = await hashServices.getHash(password)
        const newUserDto:IUserDto = {login, email, hash:passwordHash}
        const newUserDocument:UserDocument =  User.createUserBySa(newUserDto)

        await this.usersRepository.save(newUserDocument)

        result.status = ResultStatus.Created
        result.data = newUserDocument.id
        return result
    }
    async deleteUser(id: string):Promise<boolean> {
        const foundUserDocument: UserDocument | null = await this.usersRepository.findUserById(id);
        if (!foundUserDocument) return false

        return this.usersRepository.deleteUserById(id)
    }
    async activateConfirmation(id:string) {
        const foundUserDocument: UserDocument | null = await this.usersRepository.findUserById(id);
        if (!foundUserDocument) return false

        foundUserDocument.activateConfirmation()

        await this.usersRepository.save(foundUserDocument)

        return true
    }
    async updatePassHash(id:string, passwordHash: string) {
        const foundUserDocument: UserDocument | null = await this.usersRepository.findUserById(id);
        if (!foundUserDocument) return false

        foundUserDocument.updatePassHash(passwordHash)

        await this.usersRepository.save(foundUserDocument)

        return true
    }

    async setPassConfirmationCode(id:string, code:string, date:Date) {
        const foundUserDocument: UserDocument | null = await this.usersRepository.findUserById(id);
        if (!foundUserDocument) return false

        foundUserDocument.setPassConfirmationCode(code, date)

        await this.usersRepository.save(foundUserDocument)

        return true
    }

}