"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsServices = void 0;
const blog_entity_1 = require("../domain/blog.entity");
class BlogsServices {
    blogsRepository;
    constructor(blogsRepository) {
        this.blogsRepository = blogsRepository;
    }
    async createBlog(blog) {
        const { name, description, websiteUrl } = blog;
        const newBlogDto = { name, description, websiteUrl };
        const newBlogDocument = blog_entity_1.Blog.createBlogDocument(newBlogDto);
        await this.blogsRepository.save(newBlogDocument);
        return newBlogDocument.id;
    }
    async deleteBlog(id) {
        const foundBlogDocument = await this.blogsRepository.findBlogById(id);
        if (!foundBlogDocument)
            return false;
        foundBlogDocument.deleteBlog();
        await this.blogsRepository.save(foundBlogDocument);
        return true;
    }
    async updateBlog(blog, id) {
        const foundBlogDocument = await this.blogsRepository.findBlogById(id);
        if (!foundBlogDocument)
            return false;
        const { name, description, websiteUrl } = blog;
        const updateBlogDto = { name, description, websiteUrl };
        foundBlogDocument.updateBlog(updateBlogDto);
        await this.blogsRepository.save(foundBlogDocument);
        return true;
    }
}
exports.BlogsServices = BlogsServices;
//# sourceMappingURL=blogsServices.js.map