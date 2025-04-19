import {UsersRepository} from "../../users/repositories/usersRepository";
import {PostsRepository} from "../../posts/repositories/postsRepository";
import {LikesPostsRepository} from "../repository/likesPostsRepository";
import {LikeInputModel} from "../types/input/likeInput.model";
import {LikeStatus} from "../../../common/types/enum/likeStatus";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {ILikePostDto, LikePost, LikePostDocument} from "../domain/likePost.entity";


export class LikesPostsServices {
    constructor(private likesPostsRepository: LikesPostsRepository,
                private usersRepository: UsersRepository,
                private postsRepository: PostsRepository) {}
    async updatePostLike(likeInput: LikeInputModel, postId:string, userId:string) {
        const newLikeStatus = likeInput.likeStatus
        if (!(newLikeStatus in LikeStatus)) return ResultStatus.BadRequest;

        const foundUserDocument= await this.usersRepository.findUserById(userId)
        if (!foundUserDocument) return  ResultStatus.Unauthorized;//401 error
        const foundPostDocument= await this.postsRepository.findPostById(postId)
        if (!foundPostDocument) return ResultStatus.NotFound;//404 error

        //logic found and update or create new likePostDocument
        const foundLikePostDocument= await this.likesPostsRepository.findLikePostByAuthorIdAndPostId(userId, postId)
        let oldLikeStatus:LikeStatus = LikeStatus.None

        if (foundLikePostDocument) {
            oldLikeStatus = foundLikePostDocument.status
            foundLikePostDocument.updateLikePost(newLikeStatus)
            foundLikePostDocument.save()
        } else {//создание документа лайка поста
            const LikePostDto:ILikePostDto = {authorId: userId, postId: postId, status: newLikeStatus};
            const newLikePostDocument:LikePostDocument = await LikePost.createLikePostDocument(LikePostDto)
            await this.likesPostsRepository.save(newLikePostDocument)
        }
        //update or no LikeComment/Dislike counters likePostDocument
        await this.updatePostLikeCounters(oldLikeStatus, newLikeStatus, postId)

        return ResultStatus.NoContent
    }

    private async updatePostLikeCounters(oldLikeStatus: LikeStatus, newLikeStatus: LikeStatus, postId:string) {
        if (oldLikeStatus===newLikeStatus) return false //если ошибочно фронт прислал тотже статус лайка

        if (oldLikeStatus===LikeStatus.None) {
            if (newLikeStatus===LikeStatus.Like) {
                await this.postsRepository.increaseLikeCounter(postId)
            } else {
                await this.postsRepository.increaseDislikeCounter(postId)
            }
        }

        if (oldLikeStatus===LikeStatus.Like) {
            await this.postsRepository.decreaseLikeCounter(postId)
            if (newLikeStatus===LikeStatus.Dislike) {
                await this.postsRepository.increaseDislikeCounter(postId)
            }
        }

        if (oldLikeStatus===LikeStatus.Dislike) {
            await this.postsRepository.decreaseDislikeCounter(postId)
            if (newLikeStatus===LikeStatus.Like) {
                await this.postsRepository.increaseLikeCounter(postId)
            }
        }

        return true
    }

}
