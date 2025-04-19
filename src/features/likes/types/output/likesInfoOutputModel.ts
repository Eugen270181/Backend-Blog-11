import {LikeStatus} from "../../../../common/types/enum/likeStatus";

export type LikesInfoOutputModel= {
    likesCount : Number,
    dislikesCount : Number,
    myStatus: LikeStatus
}