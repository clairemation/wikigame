const current_article = {
    links :[]
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
    li=spl.map(unbracket)
    return li
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function get_wordcount(article){
    return countWords(article)
}

async function fetchWikipediaArticle(title) {
//    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(title)}&prop=extracts&explaintext`);
//    const data = await response.json();
//    const pages = data.query.pages;
//    const pageId = Object.keys(pages)[0];
//    console.log(pages)
    const b= await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/`+title)
    const bdata= await b.json();
    cn=get_citation_neededs(bdata.source)
    cl=get_clarification_neededs(bdata.source)
    li=get_outgoing_links(bdata.source)
    wc=get_wordcount(bdata.source)
    console.log(title)
    console.log(" cn:")
    console.log(cn)
    console.log(" cl:")
    console.log(cl)
    console.log(" li:")
    console.log(li)
    console.log(" wc:")
    console.log(wc)
    return "hi"
}


function loadWikiArticle(name) {
    current_article.links[0]="Richard"
    current_article.links[1]="Jeremy"
    const f= fetchWikipediaArticle('Bassoon')
    const g= fetchWikipediaArticle('Majel_Barrett')
}


console.log('asdf');
loadWikiArticle('hi');
//console.log(current_article.links)

module.exports = { loadWikiArticle };


// TO RUN IN TERMINAL, TYPE
// node FILEPATH


