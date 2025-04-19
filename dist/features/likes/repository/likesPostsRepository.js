"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesPostsRepository = void 0;
class LikesPostsRepository {
    db;
    likePostModel;
    constructor(db) {
        this.db = db;
        this.likePostModel = db.getModels().LikePostModel;
    }
    async save(likePostDocument) {
        await likePostDocument.save();
    }
    async findLikePostByAuthorIdAndPostId(authorId, postId) {
        return this.likePostModel.findOne({ authorId, postId });
    }
    async findLikePostByAuthorIdAndPostIdOrThrow(authorId, postId) {
        const likePostDocument = await this.findLikePostByAuthorIdAndPostId(authorId, postId);
        if (!likePostDocument) {
            throw new Error('not found');
        }
        return likePostDocument;
    }
    async findThreeNewestLikesByPostId(postId) {
        return this.likePostModel
            .find({ postId, deletedAt: null })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
    }
}
exports.LikesPostsRepository = LikesPostsRepository;
//# sourceMappingURL=likesPostsRepository.js.map