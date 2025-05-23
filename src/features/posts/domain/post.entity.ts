import {Model, HydratedDocument, Schema, model} from 'mongoose';


export interface IPostDto {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
}
export class Post {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: Date
    deletedAt: Date | null
    likeCount: number = 0
    dislikeCount: number = 0

    static createPostDocument({title, shortDescription, content, blogId, blogName}: IPostDto) {
        const post = new this()

        post.title = title
        post.shortDescription = shortDescription
        post.content = content
        post.blogId = blogId
        post.blogName = blogName
        post.createdAt = new Date()

        return new PostModel(post) as PostDocument
    }
    deletePost(){
        this.deletedAt = new Date()
    }
    updatePost({title, shortDescription, content, blogId, blogName}: IPostDto) {
        this.title = title
        this.shortDescription = shortDescription
        this.content = content
        this.blogId = blogId
        this.blogName = blogName
    }
}

export const postSchema:Schema<Post> = new Schema<Post>({
    title: { type: String, required: true }, // max 30
    shortDescription: { type: String, required: true }, // max 100
    content: { type: String, required: true }, // max 1000
    blogId: { type: String, required: true }, // valid
    blogName: { type: String, required: true },
    createdAt: { type: Date, required: true },
    deletedAt: { type: Date, nullable:true, default: null },
    likeCount: { type: Number, required: true, default: 0 },
    dislikeCount: { type: Number, required: true, default: 0 }
})

postSchema.loadClass(Post)

export type PostModelType = Model<Post>

export type PostDocument = HydratedDocument<Post>

export const PostModel: PostModelType = model<Post, PostModelType>(Post.name, postSchema)


