"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsController = void 0;
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const querySortSanitizer_1 = require("../../../common/module/querySortSanitizer");
class BlogsController {
    blogsServices;
    blogsQueryRepository;
    postsServices;
    postsQueryRepository;
    constructor(blogsServices, blogsQueryRepository, postsServices, postsQueryRepository) {
        this.blogsServices = blogsServices;
        this.blogsQueryRepository = blogsQueryRepository;
        this.postsServices = postsServices;
        this.postsQueryRepository = postsQueryRepository;
    }
    //методы - контролеры
    async createBlogController(req, res) {
        const newBlogId = await this.blogsServices.createBlog(req.body);
        const newBlog = await this.blogsQueryRepository.findBlogAndMap(newBlogId);
        if (!newBlog)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        return res.status(httpStatus_1.HttpStatus.Created).send(newBlog);
    }
    async getBlogsController(req, res) {
        const sanitizedSortQuery = (0, querySortSanitizer_1.querySortSanitizer)(req.query);
        const searchNameTerm = req.query.searchNameTerm;
        const blogsQueryFilter = { searchNameTerm, ...sanitizedSortQuery };
        const foundBlogs = await this.blogsQueryRepository.getBlogsAndMap(blogsQueryFilter);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundBlogs);
    }
    async findBlogController(req, res) {
        const blogId = req.params.id;
        const foundBlog = await this.blogsQueryRepository.findBlogAndMap(blogId);
        if (!foundBlog)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.status(httpStatus_1.HttpStatus.Success).send(foundBlog);
    }
    async updateBlogController(req, res) {
        const updateResult = await this.blogsServices.updateBlog(req.body, req.params.id);
        if (!updateResult)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async delBlogController(req, res) {
        const blogId = req.params.id;
        const deleteResult = await this.blogsServices.deleteBlog(blogId);
        if (!deleteResult)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async createBlogPostController(req, res) {
        const blogId = req.params.id;
        const newPostId = await this.postsServices.createPost({ ...req.body, blogId });
        if (!newPostId)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        const newPost = await this.postsQueryRepository.findPostAndMap(newPostId);
        if (!newPost)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        return res.status(httpStatus_1.HttpStatus.Created).send(newPost);
    }
    async findBlogPostsController(req, res) {
        const blogId = req.params.id;
        const foundBlog = await this.blogsQueryRepository.findBlogById(blogId);
        if (!foundBlog)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound);
        const sanitizedSortQuery = (0, querySortSanitizer_1.querySortSanitizer)(req.query);
        const getPosts = await this.postsQueryRepository.getPostsAndMap(sanitizedSortQuery, blogId);
        return res.status(httpStatus_1.HttpStatus.Success).send(getPosts);
    }
}
exports.BlogsController = BlogsController;
//# sourceMappingURL=blogs.controller.js.map