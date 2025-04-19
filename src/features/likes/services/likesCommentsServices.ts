import {LikesCommentsRepository} from "../repository/likesCommentsRepository";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {LikeInputModel} from "../types/input/likeInput.model";
import {UsersRepository} from "../../users/repositories/usersRepository";
import {CommentsRepository} from "../../comments/repositories/commentsRepository";
import {ILikeCommentDto, LikeComment, LikeCommentDocument} from "../domain/likeComment.entity";
import {LikeStatus} from "../../../common/types/enum/likeStatus";


export class LikesCommentsServices {
    constructor(private likesCommentsRepository: LikesCommentsRepository,
                private usersRepository: UsersRepository,
                private commentsRepository: CommentsRepository) {}
    async updateCommentLike(likeInput: LikeInputModel, commentId:string, userId:string) {
        const newLikeCommentStatus = likeInput.likeStatus
        if (!(newLikeCommentStatus in LikeStatus)) return ResultStatus.BadRequest;

        const foundUserDocument= await this.usersRepository.findUserById(userId)
        if (!foundUserDocument) return  ResultStatus.Unauthorized;//401 error
        const foundCommentDocument= await this.commentsRepository.findCommentById(commentId)
        if (!foundCommentDocument) return ResultStatus.NotFound;//404 error

        //logic found and update or create new likeCommentDocument
        const foundLikeCommentDocument= await this.likesCommentsRepository.findLikeCommentByAuthorIdAndCommentId(userId, commentId)
        let oldLikeStatus:LikeStatus = LikeStatus.None

        if (foundLikeCommentDocument) {
            oldLikeStatus = foundLikeCommentDocument.status
            foundLikeCommentDocument.updateLikeComment(newLikeCommentStatus)
            foundLikeCommentDocument.save()
        } else {//создание документа лайка комментария
            const LikeCommentDto:ILikeCommentDto = {authorId: userId, commentId: commentId, status: newLikeCommentStatus};
            const newLikeCommentDocument:LikeCommentDocument = await LikeComment.createLikeCommentDocument(LikeCommentDto)
            await this.likesCommentsRepository.save(newLikeCommentDocument)
        }
        //update or no LikeComment/Dislike counters foundCommentDocument
        await this.updateCommentLikeCounters(oldLikeStatus, newLikeCommentStatus, commentId)
        //console.log(`updateCommentLike:${userId}:${commentId}:${oldLikeStatus}:${newLikeStatus}`)

        return ResultStatus.NoContent
    }

    private async updateCommentLikeCounters(oldLikeStatus: LikeStatus, newLikeStatus: LikeStatus, commentId:string) {
        if (oldLikeStatus===newLikeStatus) return false //если ошибочно фронт прислал тотже статус лайка

        if (oldLikeStatus===LikeStatus.None) {
            if (newLikeStatus===LikeStatus.Like) {
                await this.commentsRepository.increaseLikeCounter(commentId)
            } else {
                await this.commentsRepository.increaseDislikeCounter(commentId)
            }
        }

        if (oldLikeStatus===LikeStatus.Like) {
            await this.commentsRepository.decreaseLikeCounter(commentId)
            if (newLikeStatus===LikeStatus.Dislike) {
                await this.commentsRepository.increaseDislikeCounter(commentId)
            }
        }

        if (oldLikeStatus===LikeStatus.Dislike) {
            await this.commentsRepository.decreaseDislikeCounter(commentId)
            if (newLikeStatus===LikeStatus.Like) {
                await this.commentsRepository.increaseLikeCounter(commentId)
            }
        }

        return true
    }

}
