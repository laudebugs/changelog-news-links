import { Article } from './types.js'

const BlacklistedDomains = ['changelog.com', 'github.com']
const pathRegex = /^(https?:\/\/[^\/]+)(?:\/)([^?]*)/
export const filterLinks = (articles: Array<Article>) => {
    return articles.filter(({ link }) => {
        if (!link) return false
        let match = link.match(pathRegex)
        if (link[link.length - 1] == '/') match = link.substring(0, link.length - 1).match(pathRegex)
        const isLikelyBlogPost = match && match.length >= 2
        return !BlacklistedDomains.some((domain) => link?.includes(domain) || !isLikelyBlogPost)
    })
}

export const filterWorkingLinks = async (articles: Array<Article>) => {
    const workingLinks = new Array<Article>()
    for await (const article of articles) {
        if (!article.link) continue
        const resonse = await fetch(article.link)
        if (resonse.ok) {
            workingLinks.push(article)
        }
    }
    return workingLinks
}
