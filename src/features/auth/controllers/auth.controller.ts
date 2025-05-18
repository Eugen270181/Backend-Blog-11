import {AuthServices} from "../services/authServices";
import {RequestWithBody, RequestWithUserId} from "../../../common/types/requests.type";
import {IdType} from "../../../common/types/id.type";
import {Request, Response} from "express";
import {MeOutputModel} from "../types/output/meOutput.model";
import {UsersQueryRepository} from "../../users/repositories/usersQueryRepository";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {LoginInputModel} from "../types/input/loginInput.model";
import {LoginSuccessOutputModel} from "../types/output/loginSuccessOutput.model";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {NewPasswordRecoveryInputModel} from "../types/input/newPasswordRecoveryInput.model";
import {PasswordRecoveryInputModel} from "../types/input/passwordRecoveryInput.model";
import {CreateUserInputModel} from "../../users/types/input/createUserInput.type";
import {RegistrationConfirmationInputModel} from "../types/input/registrationConfirmationInputModel";
import {RegistrationEmailResendingInputModel} from "../types/input/registrationEmailResendingInputModel";
import {inject, injectable} from "inversify";

@injectable()
export class AuthController {
    constructor(@inject(AuthServices) private authServices : AuthServices,
                @inject(UsersQueryRepository) private usersQueryRepository : UsersQueryRepository,
    ) {}
    getMeController = async (req: RequestWithUserId<IdType>, res: Response<MeOutputModel|{}>)=> {
        const userId = req.user?.userId as string;
        const meViewObject = await this.usersQueryRepository.getMapMe(userId)
        return res.status(HttpStatus.Success).send(meViewObject)
    }
    loginAuthController = async (req: RequestWithBody<LoginInputModel>, res: Response<LoginSuccessOutputModel>)=> {
        const devIp = req.ip??'unknown'
        const devTitle = req.headers["user-agent"]??'unknown';

        const result = await this.authServices.loginUser(req.body, devIp, devTitle)

        if (result.status === ResultStatus.Unauthorized) return res.sendStatus(HttpStatus.Unauthorized)

        if (result.status === ResultStatus.CancelledAction) return res.sendStatus(HttpStatus.InternalServerError)

        res.cookie("refreshToken", result.data!.refreshToken,{
            httpOnly: true,
            secure: true,
        });

        return res.status(HttpStatus.Success).send({accessToken:result.data!.accessToken})
    }
    logoutAuthController = async (req: Request, res: Response) => {
        const deviceId = req.device?.deviceId as string

        const result = await this.authServices.logoutUser(deviceId)

        if (result.status === ResultStatus.Unauthorized) return res.sendStatus(HttpStatus.Unauthorized)
        if (result.status === ResultStatus.CancelledAction) return res.sendStatus(HttpStatus.InternalServerError)

        return res.sendStatus(HttpStatus.NoContent)
    }
    newPasswordAuthController = async (req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) => {
        const { newPassword, recoveryCode} = req.body;
        const result = await this.authServices.confirmPassCodeEmail(newPassword, recoveryCode)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent);
    }
    passwordRecoveryAuthController = async (req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) => {
        const {email} = req.body
        const result = await this.authServices.resendPassCodeEmail(email)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
    refreshTokenAuthController = async (req: Request, res: Response<LoginSuccessOutputModel>) => {
        const userId = req.user?.userId as string
        const deviceId = req.device?.deviceId as string

        const result = await this.authServices.refreshTokens(userId,deviceId)

        if (result.status === ResultStatus.Success) {
            res.cookie("refreshToken",result.data!.refreshToken,{
                httpOnly: true,
                secure: true,
            });

            return res.status(HttpStatus.Success).send({accessToken:result.data!.accessToken})
        }

        return res.sendStatus(HttpStatus.Unauthorized)
    }
    regAuthController = async (req: RequestWithBody<CreateUserInputModel>, res: Response) => {
        const {login, password, email} = req.body

        const result = await this.authServices.registerUser( {login, password, email} )

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
    regConfirmAuthController = async (req: RequestWithBody<RegistrationConfirmationInputModel>, res: Response) => {
        const {code} = req.body;
        const result = await this.authServices.confirmRegCodeEmail(code)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent);
    }
    regEmailResendingAuthController = async (req: RequestWithBody<RegistrationEmailResendingInputModel>, res: Response) => {
        const {email} = req.body
        const result = await this.authServices.resendRegCodeEmail(email)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
}