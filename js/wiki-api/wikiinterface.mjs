const current_article = {
  li :[],
  cn :[],
  cl :[],
  refs :[],
  wc : 0,
  title : "None"
}

function cisplit(s,t){
  return s.split(new RegExp(RegExp.escape(t),"ig"))
}

export function getWordCount(){return current_article.wc;}

export function getLinks(){return current_article.li;}

export function getCitationsNeeded(){return current_article.cn;}


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
  const li=spl.map(unbracket).filter(link => (link.search(/[^a-zA-Z ]/) == -1))
  return li
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function get_wordcount(article){
  return countWords(article)
}

function get_cite_title(str){
  try {
    const a=str.split(new RegExp(RegExp.escape("title"),"ig"))[1].split("=")[1]
    const b=a.split("|")[0]
    return b;
  }catch{
    return "Dead Beef";
  }
}

function get_references(article){
  const spl=article.split(new RegExp(RegExp.escape("{{cite"),"ig")).slice(1)
  const abl=cisplit(article,"{{cite")
  return spl.map(get_cite_title);
}

export async function afetchWikipediaArticle(title) {
  const b= await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/`+title)
  const bdata= await b.json();
  current_article.cn=get_citation_neededs(bdata.source)
  current_article.cl=get_clarification_neededs(bdata.source)
  current_article.li=get_outgoing_links(bdata.source)
  current_article.wc=get_wordcount(bdata.source)
  current_article.title=title
  current_article.refs=get_references(bdata.source)
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
  console.log(" refs:")
  console.log(current_article.refs)

}
export function loadWikiArticle(name) {
  const f= fetchWikipediaArticle(name)
}


//console.log('asdf');
//await afetchWikipediaArticle("Bassoon");
//dumpWikiArticle()
//console.log(current_article.links)

//module.exports = { loadWikiArticle,dumpWikiArticle };


// TO RUN IN TERMINAL, TYPE
// node FILEPATH


