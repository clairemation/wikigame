export default async function getRandomArticleName()
{
  const result = await fetch("https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1&origin=*");
  const resultData = await result.json();
  const title = resultData.query.random[0].title
  return title;
}
