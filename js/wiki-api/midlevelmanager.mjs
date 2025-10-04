import * as Wiki from './wikiinterface.mjs'

export async function Test(){
}

export async function loadLevel(){
}

export async function treasureList(){
}

export async function exitList(){
}

console.log("hi claire")

await Wiki.afetchWikipediaArticle("Bassoon")
Wiki.dumpWikiArticle()
await Wiki.afetchWikipediaArticle("Majel_Barrett")
Wiki.dumpWikiArticle()



Test()



