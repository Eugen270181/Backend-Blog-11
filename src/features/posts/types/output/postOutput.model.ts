import {LikeStatus} from "../../../../common/types/enum/likeStatus";
import {ExtendedLikesInfoOutputModel} from "../../../likes/types/output/extendedLikesInfoOutputModel";

export type PostOutputModel = {
  id: string;
  title: string; // max 30
  shortDescription: string; // max 100
  content: string; // max 1000
  blogId: string; // valid
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoOutputModel;
}