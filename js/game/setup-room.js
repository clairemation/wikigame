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
  return {
    title: gameState.title,
    size: Math.max(articleProperties.wordCount / 400, 10),
    simplicity: 1 / (Math.ceil(articleProperties.links.length) / 70),
    links: articleProperties.links.slice(0, Math.max(articleProperties.links.length / 10, 1)),
    treasures: [...articleProperties.citationsNeeded, ...articleProperties.clarificationsNeeded]
  }
}
