import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../../common/types/requests.type";
import {CreateUserInputModel} from "../types/input/createUserInput.type";
import {Response} from "express";
import {UserOutputModel} from "../types/output/userOutput.type";
import {OutputErrorsType} from "../../../common/types/outputErrors.type";
import {UsersServices} from "../services/usersServices";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {IdType} from "../../../common/types/id.type";
import {UsersQueryFieldsType} from "../types/usersQueryFields.type";
import {Pagination} from "../../../common/types/pagination.type";
import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";
import {querySortSanitizer} from "../../../common/module/querySortSanitizer";
import {UsersQueryFilterType} from "../types/usersQueryFilter.type";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(@inject(UsersServices) private usersServices : UsersServices,
                @inject(UsersQueryRepository) private usersQueryRepository : UsersQueryRepository) {}
    createUserController = async (req: RequestWithBody<CreateUserInputModel>, res: Response<UserOutputModel|OutputErrorsType>)=> {
        const newUserResult = await this.usersServices.createUser(req.body)

        if (newUserResult.status===ResultStatus.BadRequest) {
            return res.status(HttpStatus.BadRequest).send(newUserResult.errors)
        }

        const newUser = await this.usersQueryRepository.getMapUser(newUserResult.data!)

        if (!newUser) return res.sendStatus(HttpStatus.InternalServerError)

        return res.status(HttpStatus.Created).send(newUser)
    }
    delUserController = async (req: RequestWithParams<IdType>, res: Response)=> {
        const userId = req.params.id
        const deleteResult = await this.usersServices.deleteUser(userId)
        if (!deleteResult) return res.sendStatus(HttpStatus.NotFound)
        return  res.sendStatus(HttpStatus.NoContent)
    }
    getUsersController = async (req : RequestWithQuery<UsersQueryFieldsType>, res : Response<Pagination<UserOutputModel[]>>) => {
        const sanitizedSortQuery:SortQueryFilterType = querySortSanitizer(req.query)
        const searchLoginTerm = req.query.searchLoginTerm;
        const searchEmailTerm = req.query.searchEmailTerm;
        const usersQueryFilter:UsersQueryFilterType = {searchLoginTerm, searchEmailTerm, ...sanitizedSortQuery}

        const foundUsers = await this.usersQueryRepository.getMapUsers(usersQueryFilter)
        return res.status(HttpStatus.Success).send(foundUsers)
    }
}
