import {CommentOutputModel} from "./commentOutput.model";

export type pagCommentOutputModel = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: Array<CommentOutputModel>
};
