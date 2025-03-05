import {PostsServices} from "../services/postsServices";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, RequestWithParamsAndBodyAndUserId, RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../../common/types/requests.type";
import {CreatePostInputModel} from "../types/input/createPostInput.model";
import {Response} from "express";
import {PostOutputModel} from "../types/output/postOutput.model";
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {IdType} from "../../../common/types/id.type";
import {SortQueryFieldsType} from "../../../common/types/sortQueryFields.type";
import {Pagination} from "../../../common/types/pagination.type";
import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";
import {querySortSanitizer} from "../../../common/module/querySortSanitizer";
import {UpdatePostInputModel} from "../types/input/updatePostInput.model";
import {CreateCommentInputModel} from "../../comments/types/input/createCommentInput.model";
import {CommentOutputModel} from "../../comments/types/output/commentOutput.model";
import {CommentsServices} from "../../comments/services/commentsServices";
import {CommentsQueryRepository} from "../../comments/repositories/commentsQueryRepository";
import {pagCommentOutputModel} from "../../comments/types/output/pagCommentOutput.model";
import {ResultStatus} from "../../../common/types/enum/resultStatus";


export class PostsController {
    constructor( private postsServices: PostsServices,
                 private postsQueryRepository: PostsQueryRepository,
                 private commentsServices: CommentsServices,
                 private commentsQueryRepository: CommentsQueryRepository) {}

    async createPostController (req: RequestWithBody<CreatePostInputModel>, res: Response<PostOutputModel>) {
        const newPostId = await this.postsServices.createPost(req.body)
        if (!newPostId) return res.sendStatus(HttpStatus.BadRequest)

        const newPost = await this.postsQueryRepository.findPostAndMap(newPostId)
        if (!newPost) return res.sendStatus(HttpStatus.InternalServerError)

        return res.status(HttpStatus.Created).send(newPost)
    }
    async findPostController (req: RequestWithParams<IdType>, res: Response<PostOutputModel>) {
        const foundPost = await this.postsQueryRepository.findPostAndMap(req.params.id)
        if (!foundPost) return res.sendStatus(HttpStatus.NotFound)
        return res.status(HttpStatus.Success).send(foundPost)
    }
    async getPostsController (req: RequestWithQuery<SortQueryFieldsType>, res: Response<Pagination<PostOutputModel[]>>) {
        const sanitizedSortQuery:SortQueryFilterType = querySortSanitizer(req.query)
        const foundPosts = await this.postsQueryRepository.getPostsAndMap(sanitizedSortQuery)
        return res.status(HttpStatus.Success).send(foundPosts)
    }
    async updatePostController (req: RequestWithParamsAndBody<IdType, UpdatePostInputModel>, res: Response) {
        const postId = req.params.id
        const updateResult = await this.postsServices.updatePost(req.body,postId)
        if(!updateResult) return res.sendStatus(HttpStatus.NotFound)
        return res.sendStatus(HttpStatus.NoContent)
    }
    async delPostController (req: RequestWithParams<IdType>, res: Response) {
        const postId = req.params.id;
        const deleteResult = await this.postsServices.deletePost(postId)
        if(!deleteResult) return res.sendStatus(HttpStatus.NotFound)
        return res.sendStatus(HttpStatus.NoContent)
    }
    //методы создания и нахождения комментария(ев), не существующего(связанного) без(с) поста(ом) и пользователя
    async createPostCommentController (req: RequestWithParamsAndBodyAndUserId<IdType, CreateCommentInputModel, IdType>, res: Response<CommentOutputModel>) {
        const userId = req.user?.userId as string;
        const postId = req.params.id
        const {content} = req.body

        const newCommentResult = await this.commentsServices.createComment({content}, postId, userId)
        if (newCommentResult.status!==ResultStatus.Created) {
            return res.sendStatus(HttpStatus.NotFound)
        }
        //newCommentResult.status = ResultStatus.Created
        const newCommentId = newCommentResult.data!
        const newComment = await this.commentsQueryRepository.findCommentAndMap(newCommentId)

        if (!newComment) return res.sendStatus(HttpStatus.InternalServerError)
        return res.status(HttpStatus.Created).send(newComment)
    }

    async getPostCommentsController (req:RequestWithParamsAndQuery<IdType, SortQueryFieldsType>, res:Response<pagCommentOutputModel>) {
        const userId = req.user?.userId as string;
        const postId = req.params.id
        const foundPost = await this.postsQueryRepository.findPostById(postId)
        if (!foundPost) return res.sendStatus(HttpStatus.NotFound)

        const sanitizedSortQuery = querySortSanitizer(req.query)
        const foundComments = await this.commentsQueryRepository.getCommentsAndMap(sanitizedSortQuery, postId, userId)

        return res.status(HttpStatus.Success).send(foundComments)
    }
}

