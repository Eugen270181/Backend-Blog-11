import { BlogOutputModel } from './blogOutput.model';

export type pagBlogOutputModel = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: Array<BlogOutputModel>
};
