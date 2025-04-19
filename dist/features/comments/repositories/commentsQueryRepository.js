"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsQueryRepository = void 0;
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
class CommentsQueryRepository {
    db;
    likesCommentsRepository;
    commentModel;
    constructor(db, likesCommentsRepository) {
        this.db = db;
        this.likesCommentsRepository = likesCommentsRepository;
        this.commentModel = db.getModels().CommentModel;
    }
    async findCommentById(_id) {
        return this.commentModel.findOne({ _id, deletedAt: null }).lean().catch(() => null);
    }
    async findCommentAndMap(id, userId) {
        const comment = await this.findCommentById(id);
        return comment ? this.mapComment(comment, userId) : null;
    }
    async getCommentsAndMap(query, postId, userId) {
        const filter = postId ? { postId, deletedAt: null } : { deletedAt: null };
        try {
            const comments = await this.commentModel
                .find(filter)
                .sort({ [query.sortBy]: query.sortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize)
                .lean();
            const totalCount = await this.commentModel.countDocuments(filter);
            const itemsPromisses = comments.map(el => this.mapComment(el, userId));
            const items = await Promise.all(itemsPromisses); //асинхронно, не последовательно забираем выполненые промисы
            //const items = comments.map(async (el) => {return this.mapComment(el, userId)})
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
    async mapComment(comment, userId) {
        const myStatus = await this.checkMyLikeStatus(comment._id.toString(), userId);
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: comment.commentatorInfo,
            createdAt: comment.createdAt.toISOString(),
            likesInfo: {
                likesCount: comment.likeCount,
                dislikesCount: comment.dislikeCount,
                myStatus
            }
        };
    }
    async checkMyLikeStatus(commentId, userId) {
        if (!userId)
            return likeStatus_1.LikeStatus.None;
        const myStatus = await this.likesCommentsRepository.findLikeCommentByAuthorIdAndCommentId(userId, commentId);
        return myStatus ? myStatus.status : likeStatus_1.LikeStatus.None;
    }
}
exports.CommentsQueryRepository = CommentsQueryRepository;
//# sourceMappingURL=commentsQueryRepository.js.map