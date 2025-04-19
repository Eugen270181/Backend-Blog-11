"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
class CommentsController {
    commentsServices;
    commentsQueryRepository;
    likesCommentsServices;
    constructor(commentsServices, commentsQueryRepository, likesCommentsServices) {
        this.commentsServices = commentsServices;
        this.commentsQueryRepository = commentsQueryRepository;
        this.likesCommentsServices = likesCommentsServices;
    }
    async delCommentController(req, res) {
        const userId = req.user?.userId;
        const commentId = req.params.id;
        const deleteResult = await this.commentsServices.deleteComment(commentId, userId);
        if (deleteResult === resultStatus_1.ResultStatus.NotFound)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        if (deleteResult === resultStatus_1.ResultStatus.Forbidden)
            return res.sendStatus(httpStatus_1.HttpStatus.Forbidden);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async updateCommentController(req, res) {
        const userId = req.user?.userId;
        const commentId = req.params.id;
        const { content } = req.body;
        const updateResult = await this.commentsServices.updateComment({ content }, commentId, userId);
        if (updateResult === resultStatus_1.ResultStatus.NotFound)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        if (updateResult === resultStatus_1.ResultStatus.Forbidden)
            return res.sendStatus(httpStatus_1.HttpStatus.Forbidden);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async findCommentController(req, res) {
        const userId = req.user?.userId;
        const commentId = req.params.id;
        const foundComment = await this.commentsQueryRepository.findCommentAndMap(commentId, userId);
        if (!foundComment)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        //console.log(`findCommentController:${userId}:${foundComment.id}:${foundComment.likesInfo.myStatus}`)
        return res.status(httpStatus_1.HttpStatus.Success).send(foundComment);
    }
    async updateCommentLikeController(req, res) {
        const userId = req.user?.userId;
        const commentId = req.params.id;
        const { likeStatus } = req.body;
        const updateResult = await this.likesCommentsServices.updateCommentLike({ likeStatus }, commentId, userId);
        if (updateResult === resultStatus_1.ResultStatus.BadRequest)
            return res.sendStatus(httpStatus_1.HttpStatus.BadRequest);
        if (updateResult === resultStatus_1.ResultStatus.Unauthorized)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        if (updateResult === resultStatus_1.ResultStatus.NotFound)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
}
exports.CommentsController = CommentsController;
//# sourceMappingURL=comments.controller.js.map