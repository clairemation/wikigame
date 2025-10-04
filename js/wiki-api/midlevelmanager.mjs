import * as Wiki from './wikiinterface.mjs'

export async function getArticleProperties(articleName) {

  await Wiki.afetchWikipediaArticle(articleName);
  return {
    wordCount: Wiki.getWordCount(),
    links: Wiki.getLinks(),
    citationsNeeded: Wiki.getCitationsNeeded(),
  }
}
