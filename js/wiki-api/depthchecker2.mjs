import * as Wiki from './wikiinterface.mjs'

let game=new Wiki.WikiGame();

async function grr(a,b,c){
    return await pullinPagestats(a,b,c);
}

async function pullinPagestats(name,depth,parent){
    let mine={}
    let article=new Wiki.WikiArticle(name,parent);
    let r = await article.init();
    mine = article.article;
    game.addItemToScore(article);
    if(article.isRedlink()){
	return;
    }
	
	article.getTreasures().forEach(x=>game.addItemToScore(x));
	if (depth>0){
	    try{
		for (let i=0;i<10;i++){
		console.log(i)
		console.log(name)
		console.log(mine)
		let x=await grr(mine.li[i],depth-1,name)
		}
	    }catch{
	    }
	    
	}
    return 1;
}

function urlize(link){
    return "<a href=\"http://en.wikipedia.org/wiki/"+link+"\">"+link+"</a>";
}

export async function rcheckArticleScore(name){
    let retval=""
    await pullinPagestats(name,2,name);

    game.calculateScore()
    console.log(game.returnFullTextScore(true))
    return retval
}

export async function* checkArticleScore(name){
    yield(rcheckArticleScore(name));
}


rcheckArticleScore("List of New York City Designated Landmarks in Brooklyn");
