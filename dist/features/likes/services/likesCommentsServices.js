"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesCommentsServices = void 0;
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const likeComment_entity_1 = require("../domain/likeComment.entity");
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
class LikesCommentsServices {
    likesCommentsRepository;
    usersRepository;
    commentsRepository;
    constructor(likesCommentsRepository, usersRepository, commentsRepository) {
        this.likesCommentsRepository = likesCommentsRepository;
        this.usersRepository = usersRepository;
        this.commentsRepository = commentsRepository;
    }
    async updateCommentLike(likeInput, commentId, userId) {
        const newLikeCommentStatus = likeInput.likeStatus;
        if (!(newLikeCommentStatus in likeStatus_1.LikeStatus))
            return resultStatus_1.ResultStatus.BadRequest;
        const foundUserDocument = await this.usersRepository.findUserById(userId);
        if (!foundUserDocument)
            return resultStatus_1.ResultStatus.Unauthorized; //401 error
        const foundCommentDocument = await this.commentsRepository.findCommentById(commentId);
        if (!foundCommentDocument)
            return resultStatus_1.ResultStatus.NotFound; //404 error
        //logic found and update or create new likeCommentDocument
        const foundLikeCommentDocument = await this.likesCommentsRepository.findLikeCommentByAuthorIdAndCommentId(userId, commentId);
        let oldLikeStatus = likeStatus_1.LikeStatus.None;
        if (foundLikeCommentDocument) {
            oldLikeStatus = foundLikeCommentDocument.status;
            foundLikeCommentDocument.updateLikeComment(newLikeCommentStatus);
            foundLikeCommentDocument.save();
        }
        else { //создание документа лайка комментария
            const LikeCommentDto = { authorId: userId, commentId: commentId, status: newLikeCommentStatus };
            const newLikeCommentDocument = await likeComment_entity_1.LikeComment.createLikeCommentDocument(LikeCommentDto);
            await this.likesCommentsRepository.save(newLikeCommentDocument);
        }
        //update or no LikeComment/Dislike counters foundCommentDocument
        await this.updateCommentLikeCounters(oldLikeStatus, newLikeCommentStatus, commentId);
        //console.log(`updateCommentLike:${userId}:${commentId}:${oldLikeStatus}:${newLikeStatus}`)
        return resultStatus_1.ResultStatus.NoContent;
    }
    async updateCommentLikeCounters(oldLikeStatus, newLikeStatus, commentId) {
        if (oldLikeStatus === newLikeStatus)
            return false; //если ошибочно фронт прислал тотже статус лайка
        if (oldLikeStatus === likeStatus_1.LikeStatus.None) {
            if (newLikeStatus === likeStatus_1.LikeStatus.Like) {
                await this.commentsRepository.increaseLikeCounter(commentId);
            }
            else {
                await this.commentsRepository.increaseDislikeCounter(commentId);
            }
        }
        if (oldLikeStatus === likeStatus_1.LikeStatus.Like) {
            await this.commentsRepository.decreaseLikeCounter(commentId);
            if (newLikeStatus === likeStatus_1.LikeStatus.Dislike) {
                await this.commentsRepository.increaseDislikeCounter(commentId);
            }
        }
        if (oldLikeStatus === likeStatus_1.LikeStatus.Dislike) {
            await this.commentsRepository.decreaseDislikeCounter(commentId);
            if (newLikeStatus === likeStatus_1.LikeStatus.Like) {
                await this.commentsRepository.increaseLikeCounter(commentId);
            }
        }
        return true;
    }
}
exports.LikesCommentsServices = LikesCommentsServices;
//# sourceMappingURL=likesCommentsServices.js.map