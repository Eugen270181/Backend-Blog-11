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

export class AuthController {
    constructor(private authServices : AuthServices,
                private usersQueryRepository : UsersQueryRepository,
    ) {}
    async getMeController (req: RequestWithUserId<IdType>, res: Response<MeOutputModel|{}>) {
        const userId = req.user?.userId as string;
        const meViewObject = await this.usersQueryRepository.getMapMe(userId)
        return res.status(HttpStatus.Success).send(meViewObject)
    }
    async loginAuthController (req: RequestWithBody<LoginInputModel>, res: Response<LoginSuccessOutputModel>) {
        const result = await this.authServices.loginUser(req.body,req.ip??'unknown',req.headers["user-agent"]??'unknown')

        if (result.status === ResultStatus.Unauthorized) return res.sendStatus(HttpStatus.Unauthorized)

        if (result.status === ResultStatus.CancelledAction) return res.sendStatus(HttpStatus.InternalServerError)

        res.cookie("refreshToken", result.data!.refreshToken,{
            httpOnly: true,
            secure: true,
        });

        return res.status(HttpStatus.Success).send({accessToken:result.data!.accessToken})
    }
    async logoutAuthController (req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized)

        const isLogout = await this.authServices.logoutUser(refreshToken)

        if (!isLogout) return res.sendStatus(HttpStatus.Unauthorized)

        return res.sendStatus(HttpStatus.NoContent)

    }
    async newPasswordAuthController (req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) {
        const { newPassword, recoveryCode} = req.body;
        const result = await this.authServices.confirmPassCodeEmail(newPassword, recoveryCode)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent);
    }
    async passwordRecoveryAuthController (req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) {
        const {email} = req.body
        const result = await this.authServices.resendPassCodeEmail(email)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
    async refreshTokenAuthController (req: Request, res: Response<LoginSuccessOutputModel>) {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized)

        const result = await this.authServices.refreshTokens(refreshToken)

        if (result.status === ResultStatus.Success) {
            res.cookie("refreshToken",result.data!.refreshToken,{
                httpOnly: true,
                secure: true,
            });

            return res.status(HttpStatus.Success).send({accessToken:result.data!.accessToken})
        }

        return res.sendStatus(HttpStatus.Unauthorized)
    }
    async regAuthController (req: RequestWithBody<CreateUserInputModel>, res: Response) {

        const result = await this.authServices.registerUser( req.body )

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
    async regConfirmAuthController (req: RequestWithBody<RegistrationConfirmationInputModel>, res: Response) {
        const {code} = req.body;
        const result = await this.authServices.confirmRegCodeEmail(code)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent);
    }
    async regEmailResendingAuthController (req: RequestWithBody<RegistrationEmailResendingInputModel>, res: Response) {
        const {email} = req.body
        const result = await this.authServices.resendRegCodeEmail(email)

        if (result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BadRequest).send(result.errors)

        return res.sendStatus(HttpStatus.NoContent)
    }
}