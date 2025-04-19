"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesPostsServices = void 0;
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const likePost_entity_1 = require("../domain/likePost.entity");
class LikesPostsServices {
    likesPostsRepository;
    usersRepository;
    postsRepository;
    constructor(likesPostsRepository, usersRepository, postsRepository) {
        this.likesPostsRepository = likesPostsRepository;
        this.usersRepository = usersRepository;
        this.postsRepository = postsRepository;
    }
    async updatePostLike(likeInput, postId, userId) {
        const newLikeStatus = likeInput.likeStatus;
        if (!(newLikeStatus in likeStatus_1.LikeStatus))
            return resultStatus_1.ResultStatus.BadRequest;
        const foundUserDocument = await this.usersRepository.findUserById(userId);
        if (!foundUserDocument)
            return resultStatus_1.ResultStatus.Unauthorized; //401 error
        const foundPostDocument = await this.postsRepository.findPostById(postId);
        if (!foundPostDocument)
            return resultStatus_1.ResultStatus.NotFound; //404 error
        //logic found and update or create new likePostDocument
        const foundLikePostDocument = await this.likesPostsRepository.findLikePostByAuthorIdAndPostId(userId, postId);
        let oldLikeStatus = likeStatus_1.LikeStatus.None;
        if (foundLikePostDocument) {
            oldLikeStatus = foundLikePostDocument.status;
            foundLikePostDocument.updateLikePost(newLikeStatus);
            foundLikePostDocument.save();
        }
        else { //создание документа лайка поста
            const LikePostDto = { authorId: userId, postId: postId, status: newLikeStatus };
            const newLikePostDocument = await likePost_entity_1.LikePost.createLikePostDocument(LikePostDto);
            await this.likesPostsRepository.save(newLikePostDocument);
        }
        //update or no LikeComment/Dislike counters likePostDocument
        await this.updatePostLikeCounters(oldLikeStatus, newLikeStatus, postId);
        return resultStatus_1.ResultStatus.NoContent;
    }
    async updatePostLikeCounters(oldLikeStatus, newLikeStatus, postId) {
        if (oldLikeStatus === newLikeStatus)
            return false; //если ошибочно фронт прислал тотже статус лайка
        if (oldLikeStatus === likeStatus_1.LikeStatus.None) {
            if (newLikeStatus === likeStatus_1.LikeStatus.Like) {
                await this.postsRepository.increaseLikeCounter(postId);
            }
            else {
                await this.postsRepository.increaseDislikeCounter(postId);
            }
        }
        if (oldLikeStatus === likeStatus_1.LikeStatus.Like) {
            await this.postsRepository.decreaseLikeCounter(postId);
            if (newLikeStatus === likeStatus_1.LikeStatus.Dislike) {
                await this.postsRepository.increaseDislikeCounter(postId);
            }
        }
        if (oldLikeStatus === likeStatus_1.LikeStatus.Dislike) {
            await this.postsRepository.decreaseDislikeCounter(postId);
            if (newLikeStatus === likeStatus_1.LikeStatus.Like) {
                await this.postsRepository.increaseLikeCounter(postId);
            }
        }
        return true;
    }
}
exports.LikesPostsServices = LikesPostsServices;
//# sourceMappingURL=likesPostsServices.js.map