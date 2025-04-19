"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const querySortSanitizer_1 = require("../../../common/module/querySortSanitizer");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
class PostsController {
    postsServices;
    postsQueryRepository;
    commentsServices;
    commentsQueryRepository;
    likesPostsServices;
    constructor(postsServices, postsQueryRepository, commentsServices, commentsQueryRepository, likesPostsServices) {
        this.postsServices = postsServices;
        this.postsQueryRepository = postsQueryRepository;
        this.commentsServices = commentsServices;
        this.commentsQueryRepository = commentsQueryRepository;
        this.likesPostsServices = likesPostsServices;
    }
    async createPostController(req, res) {
        const newPostId = await this.postsServices.createPost(req.body);
        if (!newPostId)
            return res.sendStatus(httpStatus_1.HttpStatus.BadRequest);
        const newPost = await this.postsQueryRepository.findPostAndMap(newPostId);
        if (!newPost)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        return res.status(httpStatus_1.HttpStatus.Created).send(newPost);
    }
    async findPostController(req, res) {
        const foundPost = await this.postsQueryRepository.findPostAndMap(req.params.id);
        if (!foundPost)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundPost);
    }
    async getPostsController(req, res) {
        const sanitizedSortQuery = (0, querySortSanitizer_1.querySortSanitizer)(req.query);
        const foundPosts = await this.postsQueryRepository.getPostsAndMap(sanitizedSortQuery);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundPosts);
    }
    async updatePostController(req, res) {
        const postId = req.params.id;
        const updateResult = await this.postsServices.updatePost(req.body, postId);
        if (!updateResult)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async delPostController(req, res) {
        const postId = req.params.id;
        const deleteResult = await this.postsServices.deletePost(postId);
        if (!deleteResult)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    //методы создания и нахождения комментария(ев), не существующего(связанного) без(с) поста(ом) и пользователя
    async createPostCommentController(req, res) {
        const userId = req.user?.userId;
        const postId = req.params.id;
        const { content } = req.body;
        const newCommentResult = await this.commentsServices.createComment({ content }, postId, userId);
        if (newCommentResult.status !== resultStatus_1.ResultStatus.Created) {
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        }
        //newCommentResult.status = ResultStatus.Created
        const newCommentId = newCommentResult.data;
        const newComment = await this.commentsQueryRepository.findCommentAndMap(newCommentId);
        if (!newComment)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        return res.status(httpStatus_1.HttpStatus.Created).send(newComment);
    }
    async getPostCommentsController(req, res) {
        const userId = req.user?.userId;
        const postId = req.params.id;
        const foundPost = await this.postsQueryRepository.findPostById(postId);
        if (!foundPost)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        const sanitizedSortQuery = (0, querySortSanitizer_1.querySortSanitizer)(req.query);
        const foundComments = await this.commentsQueryRepository.getCommentsAndMap(sanitizedSortQuery, postId, userId);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundComments);
    }
    //метод обновления лайка связанного с постом и пользователем
    async updatePostLikeController(req, res) {
        const userId = req.user?.userId;
        const postId = req.params.id;
        const { likeStatus } = req.body;
        const updateResult = await this.likesPostsServices.updatePostLike({ likeStatus }, postId, userId);
        if (updateResult === resultStatus_1.ResultStatus.BadRequest)
            return res.sendStatus(httpStatus_1.HttpStatus.BadRequest);
        if (updateResult === resultStatus_1.ResultStatus.Unauthorized)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        if (updateResult === resultStatus_1.ResultStatus.NotFound)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
}
exports.PostsController = PostsController;
//# sourceMappingURL=posts.controller.js.map