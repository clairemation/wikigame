import * as Wiki from './wikiinterface.mjs'


async function checkArticleScore(name){
    await Wiki.afetchWikipediaArticle(name);
    Wiki.dumpWikiArticle();
}

await checkArticleScore("Bassoon");
