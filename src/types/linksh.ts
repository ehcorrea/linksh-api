export type Linksh = {
  title: string,
  content: string,
  timeout: Date,
  isDeleted: boolean,
  linkshId: string,
  ownedBy: string
}

export type LinkshCreateRequest = {
  data: Pick<Linksh, "title" | "content" | "timeout">
}

export type LinkshUpdateRequest = {
  data: Pick<Linksh, "title" | "content" | "timeout">
}

