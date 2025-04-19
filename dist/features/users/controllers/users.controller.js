"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const querySortSanitizer_1 = require("../../../common/module/querySortSanitizer");
class UsersController {
    usersServices;
    usersQueryRepository;
    constructor(usersServices, usersQueryRepository) {
        this.usersServices = usersServices;
        this.usersQueryRepository = usersQueryRepository;
    }
    async createUserController(req, res) {
        const newUserResult = await this.usersServices.createUser(req.body);
        if (newUserResult.status === resultStatus_1.ResultStatus.BadRequest) {
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(newUserResult.errors);
        }
        const newUser = await this.usersQueryRepository.getMapUser(newUserResult.data);
        if (!newUser)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        return res.status(httpStatus_1.HttpStatus.Created).send(newUser);
    }
    async delUserController(req, res) {
        const userId = req.params.id;
        const deleteResult = await this.usersServices.deleteUser(userId);
        if (!deleteResult)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async getUsersController(req, res) {
        const sanitizedSortQuery = (0, querySortSanitizer_1.querySortSanitizer)(req.query);
        const searchLoginTerm = req.query.searchLoginTerm;
        const searchEmailTerm = req.query.searchEmailTerm;
        const usersQueryFilter = { searchLoginTerm, searchEmailTerm, ...sanitizedSortQuery };
        const foundUsers = await this.usersQueryRepository.getMapUsers(usersQueryFilter);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundUsers);
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map