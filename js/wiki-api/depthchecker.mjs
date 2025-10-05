import * as Wiki from './wikiinterface.mjs'

let reds=[];
let cites=[];
let claris=[];
let links=[];

async function grr(a,b){
    return await pullinPagestats(a,b);
}

async function pullinPagestats(name,depth){
    let mine={}
    mine = await Wiki.bfetchWikipediaArticle(name,mine);
    try{
	console.log("MOO2");
	let ncites=[...new Set(mine.cn)].map(ele=>[ele,name]);
	cites.push(...ncites);
//	console.log(mine);
	if (depth>0){
	    console.log(depth);
	    for (let i=0;i<10;i++){
		let x=await grr(mine.li[i],depth-1)
	    }
	    
//	    await mine.li.slice(0,10).forEach(x=>pullinPagestats(x,depth-1));
	}
    }catch{
    }
    return 1;
}

async function checkArticleScore(name){
    await pullinPagestats(name,2);
    console.log(cites);
    console.log("MOO3");
}

await checkArticleScore("Bassoon");
