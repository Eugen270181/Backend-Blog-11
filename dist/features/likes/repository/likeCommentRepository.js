"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeCommentRepository = void 0;
class LikeCommentRepository {
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
exports.LikeCommentRepository = LikeCommentRepository;
//# sourceMappingURL=likeCommentRepository.js.map