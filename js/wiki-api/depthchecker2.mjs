import * as Wiki from './wikiinterface.mjs'

let game=new Wiki.WikiGame();

async function grr(a,b,c){
    return await pullinPagestats(a,b,c);
}

async function pullinPagestats(name,depth,parent){
    let article=new Wiki.WikiArticle(name,parent);
    let r = await article.init();
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

export async function rcheckArticleScore(name){
    let retval=""
    await pullinPagestats(name,0,name);

    game.calculateScore()
    console.log(game.returnFullTextScore(false))
    return retval
}

export async function* checkArticleScore(name){
    yield(rcheckArticleScore(name));
}


rcheckArticleScore("List of New York City Designated Landmarks in Brooklyn");
