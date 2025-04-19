"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeCommentServices = void 0;
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const likeComment_entity_1 = require("../domain/likeComment.entity");
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
class LikeCommentServices {
    likesRepository;
    usersRepository;
    commentsRepository;
    constructor(likesRepository, usersRepository, commentsRepository) {
        this.likesRepository = likesRepository;
        this.usersRepository = usersRepository;
        this.commentsRepository = commentsRepository;
    }
    async updateCommentLike(likeInput, commentId, userId) {
        const newLikeStatus = likeInput.likeStatus;
        if (!(newLikeStatus in likeStatus_1.LikeStatus))
            return resultStatus_1.ResultStatus.BadRequest;
        const foundUserDocument = await this.usersRepository.findUserById(userId);
        if (!foundUserDocument)
            return resultStatus_1.ResultStatus.Unauthorized; //401 error
        const foundCommentDocument = await this.commentsRepository.findCommentById(commentId);
        if (!foundCommentDocument)
            return resultStatus_1.ResultStatus.NotFound; //404 error
        //logic found and update or create new like
        const foundLikeDocument = await this.likesRepository.findLikeCommentByAuthorIdAndCommentId(userId, commentId);
        let oldLikeStatus = likeStatus_1.LikeStatus.None;
        if (foundLikeDocument) {
            oldLikeStatus = foundLikeDocument.status;
            foundLikeDocument.updateLikeComment(newLikeStatus);
            foundLikeDocument.save();
        }
        else { //создание документа лайка
            const LikeDto = { authorId: userId, commentId: commentId, status: newLikeStatus };
            const newLikeDocument = await likeComment_entity_1.LikeComment.createLikeCommentDocument(LikeDto);
            await this.likesRepository.save(newLikeDocument);
        }
        //update or no LikeComment/Dislike counters foundCommentDocument
        await this.updateCommentsLikeCounters(oldLikeStatus, newLikeStatus, commentId);
        //console.log(`updateCommentLike:${userId}:${commentId}:${oldLikeStatus}:${newLikeStatus}`)
        return resultStatus_1.ResultStatus.NoContent;
    }
    async updateCommentsLikeCounters(oldLikeStatus, newLikeStatus, commentId) {
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
exports.LikeCommentServices = LikeCommentServices;
//# sourceMappingURL=likeCommentServices.js.map