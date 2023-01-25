import { Article } from "./types.js";

const BlacklistedDomains = ['changelog.com', 'github.com']

export const filterLinks = (articles: Array<Article>) =>{
    return articles.filter(({link}) => !BlacklistedDomains.some(domain => link?.includes(domain)))
}

export const filterWorkingLinks = async (articles: Array<Article>)=>{
    const workingLinks = new Array<Article>()
    for await (const article of articles){
        if(!article.link) continue
        const resonse = await fetch(article.link)
        if (resonse.ok){
            workingLinks.push(article)
        }
    }
    return workingLinks
}