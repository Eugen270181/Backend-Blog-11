import {LikeStatus} from "../../domain/like.entity";

export type LikesInfoOutputModel= {
    likesCount : Number,
    dislikesCount : Number,
    myStatus: LikeStatus
}