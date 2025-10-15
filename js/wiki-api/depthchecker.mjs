import * as Wiki from './wikiinterface.mjs'

let reds=[];
let cites=[];
let clari=[];
let links=[];

async function grr(a,b,c){
    return await pullinPagestats(a,b,c);
}

async function pullinPagestats(name,depth,parent){
    let mine={}
    mine = await Wiki.bfetchWikipediaArticle(name,mine);
    if(mine.is_redlink){
//	console.log("MOMOM");
//	console.log("MOO"+parent);
	reds.push([name,parent]);
	return;
    }
	
    try{
	let ncites=[...new Set(mine.cn)].map(ele=>[ele,name]);
	cites.push(...ncites);
	let nclari=[...new Set(mine.cl)].map(ele=>[ele,name]);
	clari.push(...nclari);
//	console.log(mine);
	if (depth>0){
//	    console.log(depth);
	    for (let i=0;i<10;i++){
		let x=await grr(mine.li[i],depth-1,name)
	    }
	    
//	    await mine.li.slice(0,10).forEach(x=>pullinPagestats(x,depth-1));
	}
    }catch{
    }
    return 1;
}

function urlize(link){
    return "<a href=\"http://en.wikipedia.org/wiki/"+link+"\">"+link+"</a>";
}

export async function rcheckArticleScore(name){
    let retval=""
    await pullinPagestats(name,2,name);
    let xcites=[...new Set(cites)];
    retval+=`<p><h1>Results</h1>`;
    for(let i=0;i<xcites.length;i++){
	let str = "Article "+urlize(xcites[i][1])+" has citation needed for: "+xcites[i][0]+"<p>";
	console.log(str);
	retval+=str;
    }
    for(let i=0;i<clari.length;i++){
	let str = "Article "+urlize(clari[i][1])+" has clarification needed for: "+clari[i][0]+"<p>";
	console.log(str);
	retval+=str;
    }
    for(let i=0;i<reds.length;i++){
	let str = "Article "+urlize(reds[i][1])+" has RED LINK for: "+urlize(reds[i][0])+"<p>";
	console.log(str);
	retval+=str;
    }
    let ostr = "<p>Final score is "+reds.length+"/"+clari.length+"/"+xcites.length;
    console.log(ostr);
//    console.log(cites);
    return retval
}

export async function ncheckArticleScore(name){
    let retval=""
    await pullinPagestats(name,2,name);
    let xcites=[...new Set(cites)];
    retval+=`<p><h1>Results</h1>`;
    for(let i=0;i<xcites.length;i++){
	let str = "Article "+urlize(xcites[i][1])+" has citation needed for: "+xcites[i][0]+"<p>";
	console.log(str);
	retval+=str;
    }
    for(let i=0;i<clari.length;i++){
	let str = "Article "+urlize(clari[i][1])+" has clarification needed for: "+clari[i][0]+"<p>";
	console.log(str);
	retval+=str;
    }
    for(let i=0;i<reds.length;i++){
	let str = "Article "+urlize(reds[i][1])+" has RED LINK for: "+urlize(reds[i][0])+"<p>";
	console.log(str);
	retval+=str;
    }
    let ostr = "<p>Final score is "+reds.length+"/"+clari.length+"/"+xcites.length;
    console.log(ostr);
//    console.log(cites);
    return retval
}

export async function* checkArticleScore(name){
    yield(rcheckArticleScore(name));
}


rcheckArticleScore("List of New York City Designated Landmarks in Brooklyn");
