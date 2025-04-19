"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsQueryRepository = void 0;
class BlogsQueryRepository {
    db;
    blogModel;
    constructor(db) {
        this.db = db;
        this.blogModel = db.getModels().BlogModel;
    }
    async findBlogById(_id) {
        return this.blogModel.findOne({ _id, deletedAt: null }).lean().catch(() => null);
    }
    async findBlogAndMap(id) {
        const blog = await this.findBlogById(id);
        return blog ? this.map(blog) : null;
    }
    async getBlogsAndMap(query) {
        const search = query.searchNameTerm ? { name: { $regex: query.searchNameTerm, $options: 'i' }, deletedAt: null } : { deletedAt: null };
        try {
            const blogs = await this.blogModel
                .find(search)
                .sort({ [query.sortBy]: query.sortDirection }) // объект для сортировки
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize)
                .lean();
            const totalCount = await this.blogModel.countDocuments(search);
            return {
                pagesCount: Math.ceil(totalCount / query.pageSize),
                page: query.pageNumber,
                pageSize: query.pageSize,
                totalCount,
                items: blogs.map(this.map)
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(JSON.stringify(e));
        }
    }
    map(blog) {
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership,
        };
    }
}
exports.BlogsQueryRepository = BlogsQueryRepository;
//# sourceMappingURL=blogsQueryRepository.js.map