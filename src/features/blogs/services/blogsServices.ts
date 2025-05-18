import {BlogsRepository} from "../repositories/blogsRepository";
import {CreateBlogInputModel} from "../types/input/createBlogInput.model";
import {UpdateBlogInputModel} from "../types/input/updateblogInput.model";
import {Blog, BlogDocument, IBlogDto} from "../domain/blog.entity";
import {inject, injectable} from "inversify";

@injectable()
export class BlogsServices {
    constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {}
    async createBlog(blog: CreateBlogInputModel):Promise<string> {
        const {name, description, websiteUrl} = blog

        const newBlogDto:IBlogDto = {name, description, websiteUrl}
        const newBlogDocument:BlogDocument = Blog.createBlogDocument(newBlogDto)

        await this.blogsRepository.save(newBlogDocument)

        return newBlogDocument.id
    }
    async deleteBlog(id:string){
        const foundBlogDocument: BlogDocument | null = await this.blogsRepository.findBlogById(id);
        if (!foundBlogDocument) return false;

        foundBlogDocument.deleteBlog();

        await this.blogsRepository.save(foundBlogDocument);
        return true;
    }
    async updateBlog(blog: UpdateBlogInputModel, id: string) {
        const foundBlogDocument: BlogDocument | null = await this.blogsRepository.findBlogById(id);
        if (!foundBlogDocument) return false;

        const {name, description, websiteUrl} = blog
        const updateBlogDto:IBlogDto = {name, description, websiteUrl}
        foundBlogDocument.updateBlog(updateBlogDto)

        await this.blogsRepository.save(foundBlogDocument);
        return true;
    }
}