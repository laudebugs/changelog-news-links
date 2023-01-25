export type Article = Nullable<{title: string, link: string, date: string}>
export type Nullable<T> = {[K in keyof T]: T[K] | null | undefined}
