"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeCommentSchema = exports.LikeComment = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
class LikeComment {
    authorId;
    commentId;
    status;
    createdAt;
    static createLikeCommentDocument({ authorId, commentId, status }) {
        const likeComment = new this();
        likeComment.authorId = authorId;
        likeComment.commentId = commentId;
        likeComment.status = status;
        likeComment.createdAt = new Date();
        const likeCommentModel = ioc_1.db.getModels().LikeCommentModel;
        return new likeCommentModel(likeComment);
    }
    updateLikeComment(newStatus) {
        this.status = newStatus;
    }
}
exports.LikeComment = LikeComment;
exports.likeCommentSchema = new mongoose_1.Schema({
    createdAt: { type: Date, required: true },
    status: { type: String, enum: likeStatus_1.LikeStatus, required: true, default: likeStatus_1.LikeStatus.None },
    authorId: { type: String, required: true },
    commentId: { type: String, required: true },
});
exports.likeCommentSchema.loadClass(LikeComment);
//# sourceMappingURL=likeComment.entity.js.map