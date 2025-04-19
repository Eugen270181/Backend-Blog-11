"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePostSchema = exports.LikePost = void 0;
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
const ioc_1 = require("../../../ioc");
const mongoose_1 = require("mongoose");
class LikePost {
    authorId;
    postId;
    status;
    createdAt;
    static createLikePostDocument({ authorId, postId, status }) {
        const likePost = new this();
        likePost.authorId = authorId;
        likePost.postId = postId;
        likePost.status = status;
        likePost.createdAt = new Date();
        const likePostModel = ioc_1.db.getModels().LikePostModel;
        return new likePostModel(likePost);
    }
    updateLikePost(newStatus) {
        this.status = newStatus;
    }
}
exports.LikePost = LikePost;
exports.likePostSchema = new mongoose_1.Schema({
    createdAt: { type: Date, required: true },
    status: { type: String, enum: likeStatus_1.LikeStatus, required: true, default: likeStatus_1.LikeStatus.None },
    authorId: { type: String, required: true },
    postId: { type: String, required: true },
});
exports.likePostSchema.loadClass(LikePost);
//# sourceMappingURL=postComment.entity.js.map