"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesCommentRepository = void 0;
class LikesCommentRepository {
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
exports.LikesCommentRepository = LikesCommentRepository;
//# sourceMappingURL=likesCommentRepository.js.map