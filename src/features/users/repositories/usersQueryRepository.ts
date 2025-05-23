import {WithId} from "mongodb"
import {UserOutputModel} from "../types/output/userOutput.type";
import {MeOutputModel} from "../../auth/types/output/meOutput.model";
import {UsersQueryFilterType} from "../types/usersQueryFilter.type";
import {Pagination} from "../../../common/types/pagination.type";
import {User, UserModelType} from "../domain/user.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class UsersQueryRepository {

    constructor(@inject(TYPES.UserModel) private userModel: UserModelType
    ) {}

    async findUserById(_id: string) {
        return this.userModel.findById(_id).catch(()=> null )
    }
    async getMapUser(id: string) {
        const user = await this.findUserById(id)
        return user?this.mapUser(user):null
    }
    async getMapMe(id: string) {
        const user = await this.findUserById(id)
        if (!user) return {}
        return this.mapMe(user)
    }
    async getMapUsers(query:UsersQueryFilterType):Promise<Pagination<UserOutputModel[]>> {
        const searchLogin = query.searchLoginTerm ? {login:{$regex:query.searchLoginTerm,$options:'i'}}:{}
        const searchEmail = query.searchEmailTerm ? {email:{$regex:query.searchEmailTerm,$options:'i'}}:{}
        const search = {$or:[searchLogin, searchEmail]}
        try {
            const users = await this.userModel
                .find(search)
                .sort({[query.sortBy]:query.sortDirection})
                .skip((query.pageNumber-1)*query.pageSize)
                .limit(query.pageSize)
                .lean()
            const totalCount = await this.userModel.countDocuments(search)
            return {
                pagesCount: Math.ceil(totalCount/query.pageSize),
                page: query.pageNumber,
                pageSize:query.pageSize,
                totalCount,
                items:users.map(this.mapUser)
            }
        }
        catch(e){
            console.log(e)
            throw new Error(JSON.stringify(e))
        }
    }
    mapUser(user:WithId<User>):UserOutputModel {
         return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
        }
    }
    mapMe(user:WithId<User>):MeOutputModel {
        return {
            email: user.email,
            login: user.login,
            userId: user._id.toString()
        }
    }
}
