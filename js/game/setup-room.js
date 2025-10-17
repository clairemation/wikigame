import createNewGameState from "./create-new-game-state";

const {getArticleProperties} = require("../wiki-api/midlevelmanager.mjs");
import generateMaze from './maze-generator.js';
const {viewConstants} = require("./view-constants");

export default async function setupRoom(gameState)
{
  const articleProperties = await getArticleProperties(gameState.title);
  const mazeProperties = generateMazeProperties(gameState, articleProperties);
  const maze = generateMaze(mazeProperties);
  const playerIsStillEntering = true;

  let x, y;
  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze.length; j++) {
      if (maze[i][j].type === "entrance") {
        x = i;
        y = j;
        break;
      }
      if (x)
      {
        break;
      }
    }
  }
  if (!x)
  {
    console.error("Entrance not found");
  }

  const playerGridX = x, playerGridY = y;

  const newGameState = createNewGameState(gameState,
    {
      maze,
      playerIsStillEntering,
      playerGridX,
      playerGridY
    });
  // animationFrame = requestAnimationFrame(() => loop(newGameState));

  viewConstants.roomTitleParent.innerText = newGameState.title;

  return newGameState;
}

function generateMazeProperties(gameState, articleProperties)
{
  const size = Math.min(Math.max(articleProperties.wordCount / 400, 10), 15);
  const numberOfExits =  Math.min(Math.max(articleProperties.links.length / 10, 1), 10);

  return {
    title: gameState.title,
    size: size,
    simplicity: 1 / (Math.ceil(articleProperties.links.length) / 80),
    links: grabXRandomLinks(articleProperties.links, numberOfExits),
    treasures: [...articleProperties.citationsNeeded, ...articleProperties.clarificationsNeeded]
  }
}

function grabXRandomLinks(links, x)
{
  const linksCopy = [...links]
  const randomLinks = []

  for (let i = 0; i < x; i++)
  {
    const rand = Math.floor(Math.random() * (linksCopy.length - 1));
    randomLinks.push(linksCopy[rand]);
    linksCopy.splice(rand, 1);
  }

  return randomLinks;
}
