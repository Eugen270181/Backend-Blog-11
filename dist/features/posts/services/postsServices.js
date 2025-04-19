"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsServices = void 0;
const post_entity_1 = require("../domain/post.entity");
class PostsServices {
    blogsRepository;
    postsRepository;
    constructor(blogsRepository, postsRepository) {
        this.blogsRepository = blogsRepository;
        this.postsRepository = postsRepository;
    }
    async createPost(post) {
        const { title, shortDescription, content, blogId } = post;
        const foundBlogDocument = await this.blogsRepository.findBlogById(blogId);
        if (!foundBlogDocument)
            return null;
        const newPostDto = { title, shortDescription, content, blogId, blogName: foundBlogDocument.name };
        const newPostDocument = post_entity_1.Post.createPostDocument(newPostDto);
        await this.postsRepository.save(newPostDocument);
        return newPostDocument.id;
    }
    async deletePost(id) {
        const foundPostDocument = await this.postsRepository.findPostById(id);
        if (!foundPostDocument)
            return false;
        foundPostDocument.deletePost();
        await this.postsRepository.save(foundPostDocument);
        return true;
    }
    async updatePost(post, id) {
        const foundPostDocument = await this.postsRepository.findPostById(id);
        if (!foundPostDocument)
            return false;
        const { title, shortDescription, content, blogId } = post;
        const foundBlogDocument = await this.blogsRepository.findBlogById(blogId);
        if (!foundBlogDocument)
            return false;
        const updatePostDto = { title, shortDescription, content, blogId, blogName: foundBlogDocument.name };
        foundPostDocument.updatePost(updatePostDto);
        await this.postsRepository.save(foundPostDocument);
        return true;
    }
}
exports.PostsServices = PostsServices;
//# sourceMappingURL=postsServices.js.map