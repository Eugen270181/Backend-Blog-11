"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesCommentsRepository = void 0;
class LikesCommentsRepository {
    db;
    likeCommentModel;
    constructor(db) {
        this.db = db;
        this.likeCommentModel = db.getModels().LikeCommentModel;
    }
    async save(likeCommentDocument) {
        await likeCommentDocument.save();
    }
    async findLikeCommentByAuthorIdAndCommentId(authorId, commentId) {
        return this.likeCommentModel.findOne({ authorId, commentId });
    }
}
exports.LikesCommentsRepository = LikesCommentsRepository;
//# sourceMappingURL=likesCommentsRepository.js.map