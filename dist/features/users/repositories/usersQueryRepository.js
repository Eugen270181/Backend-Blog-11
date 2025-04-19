"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersQueryRepository = void 0;
class UsersQueryRepository {
    db;
    userModel;
    constructor(db) {
        this.db = db;
        this.userModel = db.getModels().UserModel;
    }
    async findUserById(_id) {
        return this.userModel.findById(_id).catch(() => null);
    }
    async getMapUser(id) {
        const user = await this.findUserById(id);
        return user ? this.mapUser(user) : null;
    }
    async getMapMe(id) {
        const user = await this.findUserById(id);
        if (!user)
            return {};
        return this.mapMe(user);
    }
    async getMapUsers(query) {
        const searchLogin = query.searchLoginTerm ? { login: { $regex: query.searchLoginTerm, $options: 'i' } } : {};
        const searchEmail = query.searchEmailTerm ? { email: { $regex: query.searchEmailTerm, $options: 'i' } } : {};
        const search = { $or: [searchLogin, searchEmail] };
        try {
            const users = await this.userModel
                .find(search)
                .sort({ [query.sortBy]: query.sortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize)
                .lean();
            const totalCount = await this.userModel.countDocuments(search);
            return {
                pagesCount: Math.ceil(totalCount / query.pageSize),
                page: query.pageNumber,
                pageSize: query.pageSize,
                totalCount,
                items: users.map(this.mapUser)
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(JSON.stringify(e));
        }
    }
    mapUser(user) {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
        };
    }
    mapMe(user) {
        return {
            email: user.email,
            login: user.login,
            userId: user._id.toString()
        };
    }
}
exports.UsersQueryRepository = UsersQueryRepository;
//# sourceMappingURL=usersQueryRepository.js.map