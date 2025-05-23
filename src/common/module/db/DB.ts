import mongoose from "mongoose";
import { injectable } from "inversify";

@injectable()
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
            //console.log("Connected successfully to mongo server");
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await this.stop();
        }
    }
    // Метод для отключения от базы данных
    async stop() {
        await mongoose.disconnect();
        //console.log("Connection successfully closed");
    }
    // Метод для очистки базы данных
    async drop() {
        try {
            const collections = Object.keys(this.client.collections);
            for (const collectionName of collections) {
                await this.client.collections[collectionName].deleteMany({});
            }
            //console.log("All collections are cleared");
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    }
    // Метод для получения моделей коллекций
    getModels() {
        return {
            //BlogModel: mongoose.model<Blog, BlogModelType>(Blog.name,blogSchema),
            //PostModel: mongoose.model<Post, PostModelType>(Post.name, postSchema),
            //CommentModel: mongoose.model<Comment, CommentModelType>(Comment.name, commentSchema),
            //UserModel: mongoose.model<User, UserModelType>(User.name, userSchema),
            //RequestLogModel: mongoose.model<RequestLog, RequestLogModelType>(RequestLog.name, requestLogSchema),
            //SessionModel: mongoose.model<Session, SessionModelType>(Session.name, sessionSchema),
            //LikeCommentModel: mongoose.model<LikeComment, LikeCommentModelType>(LikeComment.name, likeCommentSchema),
            //LikePostModel: mongoose.model<LikePost, LikePostModelType>(LikePost.name, likePostSchema),
            //...all collections
        }
    }
}

