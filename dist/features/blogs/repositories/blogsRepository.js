"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsRepository = void 0;
class BlogsRepository {
    db;
    blogModel;
    constructor(db) {
        this.db = db;
        this.blogModel = db.getModels().BlogModel;
    }
    async save(blogDocument) {
        await blogDocument.save();
    }
    async findBlogById(_id) {
        return this.blogModel.findOne({ _id, deletedAt: null }).catch(() => null);
    }
}
exports.BlogsRepository = BlogsRepository;
//# sourceMappingURL=blogsRepository.js.map