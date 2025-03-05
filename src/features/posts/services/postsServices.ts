import {BlogsRepository} from '../../blogs/repositories/blogsRepository'
import {CreatePostInputModel} from "../types/input/createPostInput.model";
import {UpdatePostInputModel} from "../types/input/updatePostInput.model";
import {PostsRepository} from "../repositories/postsRepository";
import {IPostDto, Post, PostDocument} from "../domain/post.entity";
import {BlogDocument} from "../../blogs/domain/blog.entity";


export class PostsServices {
    constructor(private blogsRepository: BlogsRepository,
                private postsRepository: PostsRepository) {}
    async createPost(post: CreatePostInputModel):Promise<string | null> {
        const {title, shortDescription, content, blogId} = post

        const foundBlogDocument: BlogDocument | null = await this.blogsRepository.findBlogById(blogId)
        if (!foundBlogDocument) return null;

        const newPostDto:IPostDto = {title, shortDescription, content, blogId, blogName:foundBlogDocument.name}
        const newPostDocument:PostDocument = Post.createPostDocument(newPostDto)

        await this.postsRepository.save(newPostDocument)

        return newPostDocument.id
    }
    async deletePost(id: string):Promise<boolean> {
        const foundPostDocument: PostDocument | null = await this.postsRepository.findPostById(id);
        if (!foundPostDocument) return false;

        foundPostDocument.deletePost();

        await this.postsRepository.save(foundPostDocument);
        return true;
    }
    async updatePost(post: UpdatePostInputModel, id: string):Promise<boolean> {
        const foundPostDocument: PostDocument | null = await this.postsRepository.findPostById(id);
        if (!foundPostDocument) return false;

        const {title, shortDescription, content, blogId} = post

        const foundBlogDocument: BlogDocument | null = await this.blogsRepository.findBlogById(blogId)
        if (!foundBlogDocument) return false;

        const updatePostDto:IPostDto = {title, shortDescription, content, blogId, blogName:foundBlogDocument.name}
        foundPostDocument.updatePost(updatePostDto)

        await this.postsRepository.save(foundPostDocument);
        return true;
    }
}