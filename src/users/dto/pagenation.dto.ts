export class PagenationMetaDto {
  totalData: number;
  totalPage: number;
  currentPage: number;
  limit: number;
}

export class PaginatedResultDto<data> {
  data: data[];
  pagenation: PagenationMetaDto;

  constructor(partial: Partial<PaginatedResultDto<data>>) {
    Object.assign(this, partial);
  }
}
