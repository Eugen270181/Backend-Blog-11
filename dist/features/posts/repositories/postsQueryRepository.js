"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsQueryRepository = void 0;
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
class PostsQueryRepository {
    db;
    likesPostsRepository;
    userQueryRepository;
    postModel;
    constructor(db, likesPostsRepository, userQueryRepository) {
        this.db = db;
        this.likesPostsRepository = likesPostsRepository;
        this.userQueryRepository = userQueryRepository;
        this.postModel = db.getModels().PostModel;
    }
    async findPostById(_id) {
        return this.postModel.findOne({ _id, deletedAt: null }).lean().catch(() => null);
    }
    async findPostAndMap(id) {
        const post = await this.findPostById(id);
        return post ? this.mapPost(post) : null;
    }
    async getPostsAndMap(query, blogId, userId) {
        const filter = blogId ? { blogId, deletedAt: null } : { deletedAt: null };
        //const search = query.searchNameTerm ? {title:{$regex:query.searchNameTerm,$options:'i'}}:{}
        try {
            const posts = await this.postModel
                .find(filter)
                .sort({ [query.sortBy]: query.sortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize)
                .lean();
            const totalCount = await this.postModel.countDocuments(filter);
            const itemsPromisses = posts.map(el => this.mapPost(el, userId));
            const items = await Promise.all(itemsPromisses); //асинхронно, не последовательно забираем выполненые промисы
            return {
                pagesCount: Math.ceil(totalCount / query.pageSize),
                page: query.pageNumber,
                pageSize: query.pageSize,
                totalCount,
                items
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(JSON.stringify(e));
        }
    }
    async mapPost(post, userId) {
        const postId = post._id.toString();
        const myStatus = await this.checkMyLikeStatus(postId, userId);
        const newestLikes = await this.findPostThreeNewestLikes(postId);
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likeCount,
                dislikesCount: post.dislikeCount,
                myStatus,
                newestLikes
            }
        };
    }
    async checkMyLikeStatus(postId, userId) {
        if (!userId)
            return likeStatus_1.LikeStatus.None;
        const myStatus = await this.likesPostsRepository.findLikePostByAuthorIdAndPostId(userId, postId);
        return myStatus ? myStatus.status : likeStatus_1.LikeStatus.None;
    }
    async findPostThreeNewestLikes(postId) {
        const postLikes = await this.likesPostsRepository.findThreeNewestLikesByPostId(postId);
        if (!postLikes)
            return [];
        const mapPostLikes = postLikes.map(el => this.mapPostLike(el));
        return Promise.all(mapPostLikes);
    }
    async mapPostLike(el) {
        const userId = el.authorId;
        const user = await this.userQueryRepository.findUserById(userId);
        return {
            addedAt: el.createdAt.toISOString(),
            userId,
            login: user ? user.login : null
        };
    }
}
exports.PostsQueryRepository = PostsQueryRepository;
//# sourceMappingURL=postsQueryRepository.js.map