"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = exports.commentatorInfoSchema = exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
class Comment {
    content;
    postId;
    commentatorInfo;
    createdAt;
    deletedAt;
    likeCount = 0;
    dislikeCount = 0;
    static createCommentDocument({ content, postId, userId, userLogin }) {
        const comment = new this();
        comment.content = content;
        comment.postId = postId;
        comment.commentatorInfo = {
            userId,
            userLogin
        };
        comment.createdAt = new Date();
        const commentModel = ioc_1.db.getModels().CommentModel;
        return new commentModel(comment);
    }
    deleteComment() {
        this.deletedAt = new Date();
    }
    updateComment(content) {
        this.content = content;
    }
}
exports.Comment = Comment;
exports.commentatorInfoSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
}, { _id: false });
exports.commentSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    postId: { type: String, required: true },
    commentatorInfo: { type: exports.commentatorInfoSchema, required: true },
    createdAt: { type: Date, required: true },
    deletedAt: { type: Date, nullable: true, default: null },
    likeCount: { type: Number, required: true, default: 0 },
    dislikeCount: { type: Number, required: true, default: 0 }
});
exports.commentSchema.loadClass(Comment);
//# sourceMappingURL=comment.entity.js.map