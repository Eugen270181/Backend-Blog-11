"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blog_entity_1 = require("../../../features/blogs/domain/blog.entity");
const post_entity_1 = require("../../../features/posts/domain/post.entity");
const requestsLog_entity_1 = require("../../middleware/rateLimitLogger/requestsLog.entity");
const session_entity_1 = require("../../../features/security/domain/session.entity");
const user_entity_1 = require("../../../features/users/domain/user.entity");
const comment_entity_1 = require("../../../features/comments/domain/comment.entity");
const likeComment_entity_1 = require("../../../features/likes/domain/likeComment.entity");
const likePost_entity_1 = require("../../../features/likes/domain/likePost.entity");
class DB {
    client;
    // Метод для получения имени базы данных
    getDbName() {
        return this.client.name || 'No database connected';
    }
    // Метод для подключения к базе данных
    async run(url) {
        try {
            await mongoose_1.default.connect(url);
            this.client = mongoose_1.default.connection; // Сохраняем ссылку на подключение
            console.log("Connected successfully to mongo server");
        }
        catch (e) {
            console.error("Can't connect to mongo server", e);
            await this.stop();
        }
    }
    // Метод для отключения от базы данных
    async stop() {
        await mongoose_1.default.disconnect();
        console.log("Connection successfully closed");
    }
    // Метод для очистки базы данных
    async drop() {
        try {
            const collections = Object.keys(this.client.collections);
            for (const collectionName of collections) {
                await this.client.collections[collectionName].deleteMany({});
            }
            console.log("All collections are cleared");
        }
        catch (e) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    }
    // Метод для получения моделей коллекций
    getModels() {
        return {
            BlogModel: mongoose_1.default.model(blog_entity_1.Blog.name, blog_entity_1.blogSchema),
            PostModel: mongoose_1.default.model(post_entity_1.Post.name, post_entity_1.postSchema),
            CommentModel: mongoose_1.default.model(comment_entity_1.Comment.name, comment_entity_1.commentSchema),
            UserModel: mongoose_1.default.model(user_entity_1.User.name, user_entity_1.userSchema),
            RequestsLogModel: mongoose_1.default.model(requestsLog_entity_1.RequestsLog.name, requestsLog_entity_1.requestsLogSchema),
            SessionModel: mongoose_1.default.model(session_entity_1.Session.name, session_entity_1.sessionSchema),
            LikeCommentModel: mongoose_1.default.model(likeComment_entity_1.LikeComment.name, likeComment_entity_1.likeCommentSchema),
            LikePostModel: mongoose_1.default.model(likePost_entity_1.LikePost.name, likePost_entity_1.likePostSchema),
            //...all collections
        };
    }
}
exports.DB = DB;
//# sourceMappingURL=DB.js.map