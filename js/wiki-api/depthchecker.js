import * as Wiki from './wikiinterface.mjs'


async function checkArticleScore(name){
    await Wiki.fetchWikipediaArticle(name);
    Wiki.dumpWikiArticle();
}

checkArticleScore("Bassoon");
