import { launch } from 'puppeteer'
import { writeFileSync, readFileSync } from 'fs'
const BASE_URL = "https://changelog.com/"

const browser = await launch()
const webPage = await browser.newPage()

type Article = {title: string, link: string, date: string}
type Nullable<T> = {[K in keyof T]: T[K] | null | undefined}

const oldArticles: Array<Nullable<Article>> =JSON.parse( readFileSync('./data/links.json', 'utf-8')) as Array<Nullable<Article>>
const newArticles = new Array<Nullable<Article>>()

for(let page = 0; page<=345; page++){
    let url = `${BASE_URL}?page=${page}#feed`
    try {
        await webPage.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        })
        const feedArticles = await webPage.$$('article')
        let articleLogged = false
        for await(const articleElement of feedArticles){
            const articleTitleElement = await articleElement.$('.news_item-title')
            const linkElement = await articleTitleElement?.$('a')
            if(!articleTitleElement || !linkElement) continue

            /* Get the Article link and Title */
            const link = await webPage.evaluate(linkElement => linkElement.getAttribute('href'), linkElement)
            const title = await webPage.evaluate(h2Element => h2Element.textContent, articleTitleElement)

            const dateEle = await articleElement.$('span[data-style="date"]')
            const date = await webPage.evaluate(dateElement => dateElement?.textContent, dateEle)
            const article = {title, link, date}
            console.log(link)
            articleLogged = !!oldArticles.find((article)=>article.link === link)
            if(articleLogged) {
                console.log('article logged')
                break
            }
            newArticles.push(article)
        }
        if(articleLogged) break
    } catch (error: any) {
        console.log(`error encountered: ${error?.message}`)
    }
}

await browser.close()

writeFileSync('./data/links.json', JSON.stringify([...newArticles, ...oldArticles], null, 4))
