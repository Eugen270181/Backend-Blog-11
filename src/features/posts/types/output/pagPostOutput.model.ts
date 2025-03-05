import { PostOutputModel } from './postOutput.model';

export type pagPostOutputModel = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: Array<PostOutputModel>
};
