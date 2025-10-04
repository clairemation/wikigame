import * as Wiki from './wikiinterface.mjs'

export async function Test(){
}

export async function loadLevel(){
}

export async function treasureList(){
}

export async function exitList(){
}

export async function getArticleProperties(articleName) {

  return {
    wordCount: 0,
    links: [{label, url}, {label, url}],
    headerImageUrl: 'blah.jpg',
    citationsNeeded: [text1, text2],
  }
}

console.log("hi claire")

await Wiki.afetchWikipediaArticle("Bassoon")
Wiki.dumpWikiArticle()
await Wiki.afetchWikipediaArticle("Majel_Barrett")
Wiki.dumpWikiArticle()



Test()



