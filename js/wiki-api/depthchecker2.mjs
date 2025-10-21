import * as Wiki from './wikiinterface.mjs'

let game=new Wiki.WikiGame();

async function grr(a,b,c){
    return await pullinPagestats(a,b,c);
}

async function pullinPagestats(name,depth,parent){
    let article=new Wiki.WikiArticle(name,parent);
    let r = await article.init(true);
    game.addItemToScore(article);
    if(article.isRedlink()){
	return;
    }
    if(article.seemsBroke()) return;
    
	article.getTreasures().forEach(x=>game.addItemToScore(x));
	if (depth>0){
	    for (let i=0;i<10;i++){
		let x=await grr(article.getLinks()[i],depth-1,name)
	    }
	    
	}
    return 1;
}

function proctreas(x){
    let ret=""
    game.addItemToScore(x);
    ret+=game.returnSingleTextScore(x,true);
    return ret;
}


export async function rcheckArticleScore(name){
    let retval=""
    await pullinPagestats(name,1,name);

    game.calculateScore()
    retval=game.returnFullTextScore(true)
    return retval
}

export async function* checkArticleScore(name){
    let t= await rcheckArticleScore(name);
    yield t;
}


//BEGIN TEXT ADVENTURE
// code to enter an] wiki article
async function enterArt(name,parent){
    let article=new Wiki.WikiArticle(name,parent);
    let r = await article.init(true);
    let retstr=""

    game.addItemToScore(article);
    if(article.isRedlink()){
	return  "Red link";
    }
    if(article.seemsBroke()) return "Error";

    //print out the treasures in the current room
    article.getTreasures().forEach(x=>retstr+=proctreas(x));

    //print out the links as buttons
    retstr+="<h1>Exits:</h1>"
retstr+=        "<div id=quick-input-buttons>"
	retstr+="<button class=input-option data-text=\"GO HOME\">GO HOME</button>"
    for (let i=0;i<30;i++){
	let n=article.getLinks()[i]
	let c=article.getChildren()[i]
	n=c.name
	console.log(c)
	if(c.isRedlink()){
	    retstr+="<button class=input-option data-text=\""+n+"#"+name+"\">"+n+" (red)</button>"
	}else{
	    retstr+="<button class=input-option data-text=\""+n+"#"+name+"\">"+n+" (blue)</button>"
	}
	//	retstr+=article.getLinks()[i];
    }
retstr+="</div>"
    return retstr;
    
}

export async function* enterArticle(name){
    if(name=="GOO HOME"){
	//on exit print the total score
	game.calculateScore()
	let l=game.returnFullTextScore(true)
	yield l
    }else{
	let s=name.split("#")
	if(s[1]){
	    parent=s[1]
	    name=s[0]
	}else{
	    parent=s[0]
	    name=s[0]
	}
	
	let t= await enterArt(name,parent);
	yield t;
    }
}


//rcheckArticleScore("List of New York City Designated Landmarks in Brooklyn");
