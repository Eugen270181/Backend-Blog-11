import {BlogsServices} from "../services/blogsServices";
import {BlogsQueryRepository} from "../repositories/blogsQueryRepository";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../../common/types/requests.type";
import {CreateBlogInputModel} from "../types/input/createBlogInput.model";
import {Response} from "express";
import {BlogOutputModel} from "../types/output/blogOutput.model";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {IdType} from "../../../common/types/id.type";
import {UpdateBlogInputModel} from "../types/input/updateblogInput.model";
import {BlogsQueryFieldsType} from "../types/blogsQueryFields.type";
import {Pagination} from "../../../common/types/pagination.type";
import {querySortSanitizer} from "../../../common/module/querySortSanitizer";
import {BlogsQueryFilterType} from "../types/blogsQueryFilter.type";
import {SortQueryFieldsType} from "../../../common/types/sortQueryFields.type";
import {pagPostOutputModel} from "../../posts/types/output/pagPostOutput.model";
import {PostsQueryRepository} from "../../posts/repositories/postsQueryRepository";
import {CreateBlogPostInputModel} from "../../posts/types/input/createBlogPostInput.model";
import {PostOutputModel} from "../../posts/types/output/postOutput.model";
import {PostsServices} from "../../posts/services/postsServices";

export class BlogsController {
    constructor( private blogsServices: BlogsServices,
                 private blogsQueryRepository: BlogsQueryRepository,
                 private postsServices: PostsServices,
                 private postsQueryRepository: PostsQueryRepository) {}
    //методы - контролеры
    createBlogController = async (req: RequestWithBody<CreateBlogInputModel>, res: Response<BlogOutputModel>)=> {
        const newBlogId = await this.blogsServices.createBlog(req.body)
        const newBlog = await this.blogsQueryRepository.findBlogAndMap(newBlogId)

        if (!newBlog) return res.sendStatus(HttpStatus.InternalServerError)
        return res.status(HttpStatus.Created).send(newBlog)
    }
    getBlogsController = async (req:RequestWithQuery<BlogsQueryFieldsType>, res:Response<Pagination<BlogOutputModel[]>>)=> {
        const sanitizedSortQuery = querySortSanitizer(req.query)
        const searchNameTerm = req.query.searchNameTerm;
        const blogsQueryFilter:BlogsQueryFilterType = {searchNameTerm,...sanitizedSortQuery}

        const foundBlogs = await this.blogsQueryRepository.getBlogsAndMap(blogsQueryFilter)
        return res.status(HttpStatus.Success).send(foundBlogs)
    }
    findBlogController = async (req: RequestWithParams<IdType>, res: Response<BlogOutputModel | {}>)=> {
        const blogId = req.params.id
        const foundBlog = await this.blogsQueryRepository.findBlogAndMap(blogId)
        if (!foundBlog) return res.sendStatus(HttpStatus.NotFound)
        return res.status(HttpStatus.Success).send(foundBlog)
    }
    updateBlogController = async (req: RequestWithParamsAndBody<IdType, UpdateBlogInputModel>, res: Response)=> {
        const updateResult = await this.blogsServices.updateBlog(req.body,req.params.id)
        if (!updateResult) return res.sendStatus(HttpStatus.NotFound)
        return res.sendStatus(HttpStatus.NoContent)
    }
    delBlogController = async (req: RequestWithParams<IdType>, res: Response) => {
        const blogId = req.params.id;
        const deleteResult = await this.blogsServices.deleteBlog(blogId)
        if (!deleteResult) return res.sendStatus(HttpStatus.NotFound)
        return  res.sendStatus(HttpStatus.NoContent)
    }
    createBlogPostController = async (req: RequestWithParamsAndBody<IdType, CreateBlogPostInputModel>, res: Response<PostOutputModel>)=> {
        const blogId = req.params.id
        const newPostId = await this.postsServices.createPost({...req.body,blogId})
        if (!newPostId) return res.sendStatus(HttpStatus.NotFound)

        const newPost = await this.postsQueryRepository.findPostAndMap(newPostId)
        if (!newPost) return res.sendStatus(HttpStatus.InternalServerError)

        return res.status(HttpStatus.Created).send(newPost)
    }
    findBlogPostsController = async (req: RequestWithParamsAndQuery<IdType,SortQueryFieldsType>, res: Response<pagPostOutputModel>)=> {
        const blogId = req.params.id
        const userId = req.user?.userId as string;

        const foundBlog = await this.blogsQueryRepository.findBlogById(blogId)
        if (!foundBlog) return res.sendStatus(HttpStatus.NotFound)

        const sanitizedSortQuery = querySortSanitizer(req.query)

        const getPosts = await this.postsQueryRepository.getPostsAndMap(sanitizedSortQuery, userId, blogId)
        return res.status(HttpStatus.Success).send(getPosts)
    }
}

