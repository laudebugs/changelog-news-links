import { launch } from 'puppeteer'
import { writeFileSync } from 'fs'
import { Article } from './types'
const BASE_URL = "https://changelog.com/"

const browser = await launch()
const webPage = await browser.newPage()

const articles: Array<Article> = []

for(let page = 0; page<=345; page++){
    let url = `${BASE_URL}?page=${page}#feed`
    try {
        await webPage.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        })
        const feedArticles = await webPage.$$('article')
        
        for await( const articleElement of feedArticles){
            const articleTitleElement = await articleElement.$('.news_item-title')
            const linkElement = await articleTitleElement?.$('a')
            if(!articleTitleElement || !linkElement) continue

            /* Get the Article link and Title */
            const link = await webPage.evaluate(linkElement => linkElement.getAttribute('href'), linkElement)
            const title = await webPage.evaluate(h2Element => h2Element.textContent, articleTitleElement)

            const dateEle = await articleElement.$('span[data-style="date"]')
            const date = await webPage.evaluate(dateElement => dateElement?.textContent, dateEle)
            const article = {title, link, date}
            const articleLogged = articles.find((article)=>article.link === link)
            if(articleLogged) break
            articles.push(article)
        }
        console.log(`done ${page} of 345`)
    } catch (error: any) {
        console.log(`error encountered: ${error?.message}`)
    }
}

await browser.close()

writeFileSync('./data/links.json', JSON.stringify(articles, null, 4))
