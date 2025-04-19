"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = exports.Post = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
class Post {
    title;
    shortDescription;
    content;
    blogId;
    blogName;
    createdAt;
    deletedAt;
    likeCount = 0;
    dislikeCount = 0;
    static createPostDocument({ title, shortDescription, content, blogId, blogName }) {
        const post = new this();
        post.title = title;
        post.shortDescription = shortDescription;
        post.content = content;
        post.blogId = blogId;
        post.blogName = blogName;
        post.createdAt = new Date();
        const postModel = ioc_1.db.getModels().PostModel;
        return new postModel(post);
    }
    deletePost() {
        this.deletedAt = new Date();
    }
    updatePost({ title, shortDescription, content, blogId, blogName }) {
        this.title = title;
        this.shortDescription = shortDescription;
        this.content = content;
        this.blogId = blogId;
        this.blogName = blogName;
    }
}
exports.Post = Post;
exports.postSchema = new mongoose_1.Schema({
    title: { type: String, required: true }, // max 30
    shortDescription: { type: String, required: true }, // max 100
    content: { type: String, required: true }, // max 1000
    blogId: { type: String, required: true }, // valid
    blogName: { type: String, required: true },
    createdAt: { type: Date, required: true },
    deletedAt: { type: Date, nullable: true, default: null },
    likeCount: { type: Number, required: true, default: 0 },
    dislikeCount: { type: Number, required: true, default: 0 }
});
exports.postSchema.loadClass(Post);
//# sourceMappingURL=post.entity.js.map