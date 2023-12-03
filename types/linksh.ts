export type Linksh = {
  title: string,
  content: string,
  timeout: Date,
  showContent: boolean,
  isDeleted: boolean,
  linkshId: string,
  ownedBy: string
}

export type LinkshCreateRequest = {
  data: Pick<Linksh, "title" | "content" | "timeout">

}
