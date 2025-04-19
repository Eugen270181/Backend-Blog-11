"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogSchema = exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const ioc_1 = require("../../../ioc");
class Blog {
    name;
    description;
    websiteUrl;
    createdAt;
    deletedAt;
    isMembership;
    static createBlogDocument({ name, description, websiteUrl }) {
        const blog = new this();
        blog.name = name;
        blog.description = description;
        blog.websiteUrl = websiteUrl;
        blog.createdAt = new Date();
        blog.isMembership = false;
        const blogModel = ioc_1.db.getModels().BlogModel;
        return new blogModel(blog);
    }
    deleteBlog() {
        this.deletedAt = new Date();
    }
    updateBlog({ name, description, websiteUrl }) {
        this.name = name;
        this.description = description;
        this.websiteUrl = websiteUrl;
    }
}
exports.Blog = Blog;
exports.blogSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: Date, required: true },
    deletedAt: { type: Date, nullable: true, default: null },
    isMembership: { type: Boolean, required: true }
});
exports.blogSchema.loadClass(Blog);
//# sourceMappingURL=blog.entity.js.map