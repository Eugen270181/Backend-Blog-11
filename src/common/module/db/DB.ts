import mongoose from "mongoose";

import {appConfig} from "../../settings/config";
import {Blog, BlogModelType, blogSchema} from "../../../features/blogs/domain/blog.entity";
import {Post, PostModelType, postSchema} from "../../../features/posts/domain/post.entity";
import {
    RequestsLog,
    RequestsLogModelType,
    requestsLogSchema
} from "../../middleware/rateLimitLogger/requestsLog.entity";
import {Session, SessionModelType, sessionSchema} from "../../../features/security/domain/session.entity";
import {User, UserModelType, userSchema} from "../../../features/users/domain/user.entity";
import {Comment, CommentModelType, commentSchema} from "../../../features/comments/domain/comment.entity";
import {Like, LikeModelType, likeSchema} from "../../../features/likes/domain/like.entity";


export class DB {
    private client: mongoose.Connection

    // Метод для получения имени базы данных
    getDbName() {
        return this.client.name || 'No database connected';
    }
    // Метод для подключения к базе данных
    async run(url: string) {
        try {
            await mongoose.connect(url);
            this.client = mongoose.connection; // Сохраняем ссылку на подключение
            console.log("Connected successfully to mongo server");
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await this.stop();
        }
    }
    // Метод для отключения от базы данных
    async stop() {
        await mongoose.disconnect();
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
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    }
    // Метод для получения моделей коллекций
    getModels() {
        return {
            BlogModel: mongoose.model<Blog, BlogModelType>(appConfig.BLOGS_COLLECTION_NAME,blogSchema),
            PostModel: mongoose.model<Post, PostModelType>(appConfig.POSTS_COLLECTION_NAME, postSchema),
            CommentModel: mongoose.model<Comment, CommentModelType>(appConfig.COMMENTS_COLLECTION_NAME, commentSchema),
            UserModel: mongoose.model<User, UserModelType>(appConfig.USERS_COLLECTION_NAME, userSchema),
            RequestsLogModel: mongoose.model<RequestsLog, RequestsLogModelType>(appConfig.REQUESTS_COLLECTION_NAME, requestsLogSchema),
            SessionModel: mongoose.model<Session, SessionModelType>(appConfig.SESSIONS_COLLECTION_NAME, sessionSchema),
            LikeModel: mongoose.model<Like, LikeModelType>(appConfig.LIKES_COLLECTION_NAME, likeSchema),
            //...all collections
        }
    }
}

