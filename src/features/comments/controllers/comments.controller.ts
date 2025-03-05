import {CommentsServices} from "../services/commentsServices";
import {CommentsQueryRepository} from "../repositories/commentsQueryRepository";
import {
    RequestWithParams,
    RequestWithParamsAndBodyAndUserId,
    RequestWithParamsAndUserId
} from "../../../common/types/requests.type";
import {IdType} from "../../../common/types/id.type";
import {Response} from "express";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {CreateCommentInputModel} from "../types/input/createCommentInput.model";
import {CommentOutputModel} from "../types/output/commentOutput.model";
import {LikeInputModel} from "../../likes/types/input/likeInput.model";
import {LikesServices} from "../../likes/services/likesServices";


export class CommentsController {
    constructor(private commentsServices: CommentsServices,
                private commentsQueryRepository: CommentsQueryRepository,
                private likesServices: LikesServices,
                ) {}
    async delCommentController (req: RequestWithParamsAndUserId<IdType,IdType>, res: Response) {
        const userId = req.user?.userId as string
        const commentId = req.params.id
        const deleteResult = await this.commentsServices.deleteComment(commentId,userId)

        if (deleteResult === ResultStatus.NotFound) return res.sendStatus(HttpStatus.NotFound)
        if (deleteResult === ResultStatus.Forbidden) return res.sendStatus(HttpStatus.Forbidden)

        return  res.sendStatus(HttpStatus.NoContent)
    }
    async updateCommentController (req: RequestWithParamsAndBodyAndUserId<IdType, CreateCommentInputModel, IdType>, res: Response) {
        const userId = req.user?.userId as string;
        const commentId = req.params.id
        const {content} = req.body
        const updateResult = await this.commentsServices.updateComment({content}, commentId, userId)

        if (updateResult===ResultStatus.NotFound) return res.sendStatus(HttpStatus.NotFound)
        if (updateResult===ResultStatus.Forbidden) return res.sendStatus(HttpStatus.Forbidden)

        return res.sendStatus(HttpStatus.NoContent)
    }
    async updateCommentLikeController (req: RequestWithParamsAndBodyAndUserId<IdType, LikeInputModel, IdType>, res: Response) {
        const userId = req.user?.userId as string;
        const commentId = req.params.id
        const {likeStatus} = req.body

        const updateResult = await this.likesServices.updateCommentLike({likeStatus}, commentId, userId)

        if (updateResult===ResultStatus.BadRequest) return res.sendStatus(HttpStatus.BadRequest)
        if (updateResult===ResultStatus.Unauthorized) return res.sendStatus(HttpStatus.Unauthorized)
        if (updateResult===ResultStatus.NotFound) return res.sendStatus(HttpStatus.NotFound)

        return res.sendStatus(HttpStatus.NoContent)
    }

    async findCommentController (req: RequestWithParams<IdType>, res: Response<CommentOutputModel>) {
        const userId = req.user?.userId as string;
        const commentId = req.params.id
        const foundComment = await this.commentsQueryRepository.findCommentAndMap(commentId, userId)

        if (!foundComment) return res.sendStatus(HttpStatus.NotFound)

        //console.log(`findCommentController:${userId}:${foundComment.id}:${foundComment.likesInfo.myStatus}`)

        return res.status(HttpStatus.Success).send(foundComment)
    }

}



