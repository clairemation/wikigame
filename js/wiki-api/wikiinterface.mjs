const current_article = {
    li :[],
    cn :[],
    cl :[],
    wc : 0,
    title : "None"
}

function reverse_trunc(str){
    const bstr=str
    const delim=bstr.slice(-1)
    if(delim[0] == "."){
	return bstr.split(/[;.\n]/).at(-2)+"."
    }else{
	return bstr.split(/[;.\n]/).at(-1)+"."
    }	
}

function get_citation_neededs(article){
    const spl=article.split("{{cn")

    const citations = spl.map(reverse_trunc).slice(0,-1)
    return citations
}

function get_clarification_neededs(article){
    const spl=article.split("{{clarify")

//    console.log(spl[0])
    const citations = spl.map(reverse_trunc).slice(0,-1)
    return citations
}

function unbracket(l){
    return l.split("]]")[0];

}
    
function get_outgoing_links(article){
    const spl=article.split("[[").slice(1)
    const li=spl.map(unbracket)
    return li
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function get_wordcount(article){
    return countWords(article)
}

export async function afetchWikipediaArticle(title) {
    const b= await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/`+title)
    const bdata= await b.json();
    current_article.cn=get_citation_neededs(bdata.source)
    current_article.cl=get_clarification_neededs(bdata.source)
    current_article.li=get_outgoing_links(bdata.source)
    current_article.wc=get_wordcount(bdata.source)
    current_article.title=title
    console.log(current_article.title);
    return "hi"
}

async function aafetchWikipediaArticle(title) {
    const a=  afetchWikipediaArticle(title);
}

export function fetchWikipediaArticle(title) {
    aafetchWikipediaArticle(title);
    console.log(title);
    console.log(current_article.title);
}

export function dumpWikiArticle() {
    console.log(current_article.title)
    console.log(" cn:")
    console.log(current_article.cn)
    console.log(" cl:")
    console.log(current_article.cl)
    console.log(" li:")
    console.log(current_article.li)
    console.log(" wc:")
    console.log(current_article.wc)

}
export function loadWikiArticle(name) {
    const f= fetchWikipediaArticle(name)
}


console.log('asdf');
await afetchWikipediaArticle("Bassoon");
dumpWikiArticle()
//console.log(current_article.links)

//module.exports = { loadWikiArticle,dumpWikiArticle };


// TO RUN IN TERMINAL, TYPE
// node FILEPATH


