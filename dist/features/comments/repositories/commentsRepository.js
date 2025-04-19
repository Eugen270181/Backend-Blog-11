"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsRepository = void 0;
class CommentsRepository {
    db;
    commentModel;
    constructor(db) {
        this.db = db;
        this.commentModel = db.getModels().CommentModel;
    }
    async save(commentDocument) {
        await commentDocument.save();
    }
    async findCommentById(_id) {
        return this.commentModel.findOne({ _id, deletedAt: null }).catch(() => null);
    }
    async increaseLikeCounter(_id) {
        await this.commentModel.updateOne({ _id, deletedAt: null }, { $inc: { likeCount: 1 } });
    }
    async decreaseLikeCounter(_id) {
        await this.commentModel.updateOne({ _id, deletedAt: null }, { $inc: { likeCount: -1 } });
    }
    async increaseDislikeCounter(_id) {
        await this.commentModel.updateOne({ _id, deletedAt: null }, { $inc: { dislikeCount: 1 } });
    }
    async decreaseDislikeCounter(_id) {
        await this.commentModel.updateOne({ _id, deletedAt: null }, { $inc: { dislikeCount: -1 } });
    }
}
exports.CommentsRepository = CommentsRepository;
//# sourceMappingURL=commentsRepository.js.map