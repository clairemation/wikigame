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
export function getClarificationsNeeded(){return current_article.cl;}


function reverse_trunc(str){
    const bstr=str
    const delim=bstr.slice(-1)
    if(delim[0] == "."){
	return bstr.split(/[;}>.\n]/).at(-2)+"."
    }else{
	return bstr.split(/[;}>.\n]/).at(-1)+"."
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
    if(l.includes("#")){
	return l.split("]]")[0].split("#")[0];
    }
    if(l.includes("|")){
	return l.split("]]")[0].split("|")[0];
    }
    return l.split("]]")[0];
}
    
function get_outgoing_links(article){
    const spl=article.split("[[").slice(1);
     const   sspl=spl.filter(str=>!str.includes(":"));
    const li=sspl.map(unbracket);
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

function is_redlink(article){
    return article.includes("nonexistend-title");
}

function isnt_article(article){
    return article.includes("REDIRECT");
}


export async function afetchWikipediaArticle(title,ncurrent_article) {
    const b= await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/`+title);
    if(!b.ok) {ncurrent_article.is_redlink=true;return true;}
    ncurrent_article.is_redlink=false;
    const bdata= await b.json();
    if (isnt_article(bdata.source)){current_article.dead=true; return true;}

    ncurrent_article.cn=get_citation_neededs(bdata.source)
    ncurrent_article.cl=get_clarification_neededs(bdata.source)
    ncurrent_article.li=get_outgoing_links(bdata.source)
    ncurrent_article.wc=get_wordcount(bdata.source)
    ncurrent_article.title=title
    ncurrent_article.refs=get_references(bdata.source)
//    console.log(ncurrent_article.title);
    return false
}

export async function dfetchWikipediaArticle(title){
    const b= await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/`+title);
    if(!b.ok) {current_article.is_redlink=true;return;}
    current_article.is_redlink=false;
    const bdata= await b.json();

    current_article.cn=get_citation_neededs(bdata.source)
    current_article.cl=get_clarification_neededs(bdata.source)
    current_article.li=get_outgoing_links(bdata.source)
    current_article.wc=get_wordcount(bdata.source)
    current_article.title=title
    current_article.refs=get_references(bdata.source)
//    console.log(ncurrent_article.title);
    return "hi"
}

export async function bfetchWikipediaArticle(title,n){
    let x=await afetchWikipediaArticle(title,n);
    return n;
}
export async function cfetchWikipediaArticle(title){
    let x=await afetchWikipediaArticle(title,current_article);
    return n;
}
async function aafetchWikipediaArticle(title) {
    const a=  afetchWikipediaArticle(title);
}

export function fetchWikipediaArticle(title) {
    aafetchWikipediaArticle(title);
//    console.log(title);
//    console.log(current_article.title);
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

export class WikiArticle{
    constructor(name,parent){
	this.name=name;
	this.article={};
	this.type="deadlink"
	this.parent=parent;
	this.treasures=[]
	this.initialized=false
    }

    isRedlink(){return this.article.is_redlink};
    seemsBroke(){
	if (!this.article.title) return true
	return false
    }

    async init(){
	this.article={};
	if (await afetchWikipediaArticle(this.name,this.article)){
	    if(this.isRedlink()) this.type="redlink";
	    return;
	}
	this.type="article"
//	console.log("hj")
//	console.log(this.article)
	//	this.cns=this.article.cn.map(x=>{textx})
	this.treasures.push(...this.article.cn.map((x)=>({type:"citation needed",text:x,parent:this.parent})))
	this.treasures.push(...this.article.cl.map((x)=>({type:"clarification needed",text:x,parent:this.parent})))
//	console.log(this.treasures);
//	console.log(this.article.cn)
//	console.log(this.article.title)
//	console.log(this.cns)
	return true;
    }

    getTreasures(){
	return this.treasures;
    }
    getLinks(){
	return this.article.li;
    }
}

function urlize(link,html){
    if(html) return "<a href=\"http://en.wikipedia.org/wiki/"+link+"\">"+link+"</a>";
    return link
}

// members: output_html, conventional_score
export class WikiGame{
    constructor(){
	this.score=0;
	this.articles=[];
	this.clari=[];
	this.links=[];
	this.cites=[];
	this.treasure_pile=[];
	
    }


    
    addItemToScore(item){
	this.treasure_pile.push(item);
    }

    ScoreSingleItem(item){
	if(item.type=="redlink"){
	    this.score+=100;
	}
	if(item.type=="citation needed"){
	    this.score+=10;
	}
    }
    
    calculateScore(){
	this.treasure_pile.forEach(x=>this.ScoreSingleItem(x))
    }

    returnSingleTextScore(treasure,html){
	let str=""

	switch(treasure.type){
	case "redlink":
	    if(0&&html){
		
	    }else{
		str+="Article "+urlize(treasure.parent,html)+" has redlink of " +urlize(treasure.name,html)+"\n"
	    }
	    break;
	case "citation needed":
	case "clarification needed":
	    if(0&&html){
	    }else{
		str+="Article "+urlize(treasure.parent,html)+" has "+treasure.type+" of " +treasure.text+"\n"
	    }
	    break;
	    
	}
	return str
    }
    
    returnFullTextScore(html_mode){
	let totstr=""

	this.treasure_pile.forEach(x=>totstr+=this.returnSingleTextScore(x,html_mode))
	return totstr;
    }

    getTotalScore(){return this.score;}
    
}

//console.log('asdf');
//await afetchWikipediaArticle("Bassoon");
//dumpWikiArticle()
//console.log(current_article.links)

//module.exports = { loadWikiArticle,dumpWikiArticle };


// TO RUN IN TERMINAL, TYPE
// node FILEPATH


