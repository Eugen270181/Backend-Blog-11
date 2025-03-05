import {LikesRepository} from "../repository/likesRepository";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {LikeInputModel} from "../types/input/likeInput.model";
import {UsersRepository} from "../../users/repositories/usersRepository";
import {CommentsRepository} from "../../comments/repositories/commentsRepository";
import {ILikeDto, Like, LikeDocument, LikeStatus} from "../domain/like.entity";


export class LikesServices {
    constructor(private likesRepository: LikesRepository,
                private usersRepository: UsersRepository,
                private commentsRepository: CommentsRepository) {}
    async updateCommentLike(likeInput: LikeInputModel, commentId:string, userId:string) {
        const newLikeStatus = likeInput.likeStatus
        if (!(newLikeStatus in LikeStatus)) return ResultStatus.BadRequest;

        const foundUserDocument= await this.usersRepository.findUserById(userId)
        if (!foundUserDocument) return  ResultStatus.Unauthorized;//401 error
        const foundCommentDocument= await this.commentsRepository.findCommentById(commentId)
        if (!foundCommentDocument) return ResultStatus.NotFound;//404 error

        //logic found and update or create new like
        const foundLikeDocument= await this.likesRepository.findLikeByAuthorIdAndParentId(userId, commentId)
        let oldLikeStatus:LikeStatus = LikeStatus.None

        if (foundLikeDocument) {
            oldLikeStatus = foundLikeDocument.status
            foundLikeDocument.updateLike(newLikeStatus)
            foundLikeDocument.save()
        } else {//создание документа лайка
            const LikeDto:ILikeDto = {authorId: userId, parentId: commentId, status: newLikeStatus};
            const newLikeDocument:LikeDocument = await Like.createLikeDocument(LikeDto)
            await this.likesRepository.save(newLikeDocument)
        }
        //update or no Like/Dislike counters foundCommentDocument
        await this.updateCommentsLikeCounters(oldLikeStatus, newLikeStatus, commentId)
        //console.log(`updateCommentLike:${userId}:${commentId}:${oldLikeStatus}:${newLikeStatus}`)

        return ResultStatus.NoContent
    }

    private async updateCommentsLikeCounters(oldLikeStatus: LikeStatus, newLikeStatus: LikeStatus, commentId:string) {
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
