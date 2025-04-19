"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsRepository = void 0;
class PostsRepository {
    db;
    postModel;
    constructor(db) {
        this.db = db;
        this.postModel = db.getModels().PostModel;
    }
    async save(post) {
        await post.save();
    }
    async findPostById(_id) {
        return this.postModel.findOne({ _id, deletedAt: null }).catch(() => null);
    }
    async increaseLikeCounter(_id) {
        await this.postModel.updateOne({ _id, deletedAt: null }, { $inc: { likeCount: 1 } });
    }
    async decreaseLikeCounter(_id) {
        await this.postModel.updateOne({ _id, deletedAt: null }, { $inc: { likeCount: -1 } });
    }
    async increaseDislikeCounter(_id) {
        await this.postModel.updateOne({ _id, deletedAt: null }, { $inc: { dislikeCount: 1 } });
    }
    async decreaseDislikeCounter(_id) {
        await this.postModel.updateOne({ _id, deletedAt: null }, { $inc: { dislikeCount: -1 } });
    }
}
exports.PostsRepository = PostsRepository;
//# sourceMappingURL=postsRepository.js.map