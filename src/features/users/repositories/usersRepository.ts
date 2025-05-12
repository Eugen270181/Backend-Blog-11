import {UserDocument, UserModelType} from "../domain/user.entity";
import {DB} from "../../../common/module/db/DB";

export class UsersRepository {
    private userModel: UserModelType

    constructor(private db: DB) {
        this.userModel = db.getModels().UserModel
    }
    async save(userDocument: UserDocument) {
        await userDocument.save()
    }
    async deleteUserById(_id:string){
        const result = await this.userModel.deleteOne({_id});
        return result.deletedCount > 0
    }
    async findUserById(_id: string):Promise< UserDocument | null > {
        return this.userModel.findById(_id).catch(()=> null )
    }
    async findByLoginOrEmail(inputLogin:string):Promise<UserDocument | null>{
        const search = { $or: [{ login: inputLogin }, { email: inputLogin }] };
        return this.userModel.findOne(search);
    }
    async findUserByLogin(login: string) {
        return this.userModel.findOne({login} )
    }
    async findUserByEmail(email: string) {
        return this.userModel.findOne({email} )
    }
    async findUserByRegConfirmCode(code: string) {
        return this.userModel.findOne({ 'emailConfirmation.confirmationCode': code } )
    }
    async findUserByPassConfirmCode(code: string) {
        return this.userModel.findOne({ 'passConfirmation.confirmationCode': code} )
    }
}