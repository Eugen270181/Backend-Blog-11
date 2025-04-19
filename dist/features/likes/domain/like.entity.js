"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeSchema = exports.Like = exports.LikeStatus = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
var LikeStatus;
(function (LikeStatus) {
    LikeStatus["None"] = "None";
    LikeStatus["Like"] = "Like";
    LikeStatus["Dislike"] = "Dislike";
})(LikeStatus || (exports.LikeStatus = LikeStatus = {}));
class Like {
    authorId;
    parentId;
    status;
    createdAt;
    static createLikeDocument({ authorId, parentId, status }) {
        const like = new this();
        like.authorId = authorId;
        like.parentId = parentId;
        like.status = status;
        like.createdAt = new Date();
        const likeModel = ioc_1.db.getModels().LikeModel;
        return new likeModel(like);
    }
    updateLike(newStatus) {
        this.status = newStatus;
    }
}
exports.Like = Like;
exports.likeSchema = new mongoose_1.Schema({
    createdAt: { type: Date, required: true },
    status: { type: String, enum: LikeStatus, required: true, default: LikeStatus.None },
    authorId: { type: String, required: true },
    parentId: { type: String, required: true },
});
exports.likeSchema.loadClass(Like);
//# sourceMappingURL=like.entity.js.map