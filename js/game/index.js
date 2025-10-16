import render from "./render";

const nmg = require('node-maze-generator');
const {getArticleProperties} = require('../wiki-api/midlevelmanager.mjs');
import generateMaze from './maze-generator.js';
import {viewConstants} from './view-constants.js';

let animationFrame;
let keyStatus = {};

const shouldPopulateTreasures = gameState => !gameState.acquiredTreasures.find(entry => entry.room === title)

viewConstants.scoreParent.addEventListener('click', e => alert(gameState.acquiredTreasures))

start();

function start()
{
  const gameStateProperties = {
    acquiredTreasures: [],
    currentRoomAcquiredTreasures: [],
    playerIsStillEntering: false,
    entranceName: 'bassoon',
    maze: [],
    score: 0,
    title: 'bassoon',
    playerDirectionX: 0,
    playerDirectionY: 0,
    playerSpeed: 0.05,
    playerGridX: 0,
    playerGridY: 0,
  }

  const gameState = createNewGameState({}, gameStateProperties);

  startRoom(gameState);
}

function createNewGameState(gameState, newProperties)
{
  const newGameState = {...gameState, ...newProperties};
  Object.freeze(newGameState);
  return newGameState;
}

async function startRoom(gameState)
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

  const newGameState = createNewGameState(gameState, {maze, playerIsStillEntering, playerGridX, playerGridY});
  animationFrame = requestAnimationFrame(() => loop(newGameState));

  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  addEventListener("mousedown", processMouseClick);

  viewConstants.roomTitleParent.innerText = newGameState.title;
}

function stopAndClear()
{
  cancelAnimationFrame(animationFrame);
  keyStatus = {};
  removeEventListener("keydown", onKeyDown);
  removeEventListener("keyup", onKeyUp);
  removeEventListener("mousedown", processMouseClick);
}

function onKeyDown(e)
{
  keyStatus[e.key] = true
}

function onKeyUp(e)
{
  keyStatus[e.key] = false;
}

function loop(gameState)
{
  const gameStateUpdates = {}

  const playerGridPos = calcNewPlayerPosition(gameState);
  gameStateUpdates.playerGridX = playerGridPos.x;
  gameStateUpdates.playerGridY = playerGridPos.y;

  const treasureAcquired = isPlayerOnTreasure(gameState);
  if (treasureAcquired)
  {
    gameStateUpdates.score = gameState.score + 1;
    gameStateUpdates.currentRoomAcquiredTreasures = [...gameState.currentRoomAcquiredTreasures, treasureAcquired];

    // Yeah, this is not optimal for a huge maze, but we don't have a huge maze
    // Also I don't think it even actually succeeds at being immutable at the cell level
    const maze = {...gameState.maze};
    maze[Math.floor(gameState.playerGridX)][Math.floor(gameState.playerGridY)].type = "space";
    gameStateUpdates.maze = maze;
  }


  const {playerIsOnExit, exitTitle} = isPlayerOnExit(gameState);
  if (playerIsOnExit)
  {
    if (gameState.currentRoomAcquiredTreasures.length > 0) {
      gameStateUpdates.acquiredTreasures = [...gameState.acquiredTreasures, {room: gameState.title, treasures: gameState.currentRoomAcquiredTreasures}];
    }

    gameStateUpdates.currentRoomAcquiredTreasures = [];
    gameStateUpdates.entranceName = gameState.title;
    gameStateUpdates.title = exitTitle;

    const newGameState = createNewGameState(gameState, gameStateUpdates);

    stopAndClear();
    startRoom(newGameState);
    return;
  }

  let playerIsStillEntering = true;
  if (isPlayerOnEntrance(gameState))
  {
    if (!gameState.playerIsStillEntering)
    {
      gameStateUpdates.title = gameState.entranceName;
      gameStateUpdates.entranceName = gameState.entranceName;

      const newGameState = createNewGameState(gameState, gameStateUpdates);
      stopAndClear();
      startRoom(newGameState);
      return;
    }
  }
  else
  {
    playerIsStillEntering = false;
  }



  const newGameState = createNewGameState(gameState,
    {
      playerIsStillEntering,
      playerGridX: playerGridPos.x,
      playerGridY: playerGridPos.y
    });

  render(gameState);

  animationFrame = requestAnimationFrame(() => loop(newGameState));
}

function isPlayerOnExit(gameState)
{
  const cell = gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))];
  const playerIsOnExit = cell.type === "exit"
  const exitTitle = cell.title;
  return {playerIsOnExit, exitTitle};
}

function isPlayerOnTreasure(gameState)
{
  return (
    gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].type === 'treasure'
      ? gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].name
      : false
  );
}

function isPlayerOnEntrance(gameState)
{
  return gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].type === 'entrance';
}

function processMouseClick(e)
{
  // try {
  //   const clickGridPositionX = Math.floor((e.clientX - e.target.clientLeft + windowX) / CELL_WIDTH);
  //   const clickGridPositionY = Math.floor((e.clientY - e.target.clientTop + windowY) / CELL_HEIGHT)
  //
  //   if (maze[clickGridPositionX][clickGridPositionY].type === "exit") {
  //     linkInfoParent.innerText = positionToLinkName[clickGridPositionX][clickGridPositionY];
  //   }
  //   if (maze[clickGridPositionX][clickGridPositionY].type === "treasure") {
  //     linkInfoParent.innerText = maze[clickGridPositionX][clickGridPositionY].name;
  //   }
  //   if (maze[clickGridPositionX][clickGridPositionY].type === "entrance") {
  //     linkInfoParent.innerText = entranceName;
  //   }
  // }
  // catch (e)
  // {
  //   console.error(e)
  // }
}

function calcNewPlayerPosition(gameState)
{
  const newPlayerGridPosition = {x: 0, y: 0};

  let playerDirectionX = 0, playerDirectionY = 0;

  if (keyStatus['w']) playerDirectionY--;
  if (keyStatus['a']) playerDirectionX--;
  if (keyStatus['s']) playerDirectionY++;
  if (keyStatus['d']) playerDirectionX++;

  let velocityX = playerDirectionX * gameState.playerSpeed;
  let velocityY = playerDirectionY * gameState.playerSpeed;

  let checkPoints = {
    upperLeft: {x: gameState.playerGridX + velocityX + 0.2, y: gameState.playerGridY +  velocityY + 0.2},
    upperRight: {x: gameState.playerGridX + velocityX + 0.8, y: gameState.playerGridY + velocityY + 0.2},
    lowerRight: {x: gameState.playerGridX + velocityX + 0.8, y: gameState.playerGridY + velocityY + 0.8},
    lowerLeft: {x: gameState.playerGridX + velocityX + 0.2, y: gameState.playerGridY + velocityY + 0.8},
  }

  if (velocityX < 0)
  {
    if (checkForWall(gameState, checkPoints.upperLeft) || checkForWall(gameState, checkPoints.lowerLeft))
    {
      velocityX = 0;
    }
  }

  else if (velocityX > 0)
  {
    if (checkForWall(gameState, checkPoints.upperRight) || checkForWall(gameState, checkPoints.lowerRight))
    {
      velocityX = 0;
    }
  }

  if (velocityY < 0)
  {
    if (checkForWall(gameState, checkPoints.upperLeft) || checkForWall(gameState, checkPoints.upperRight))
    {
      velocityY = 0;
    }
  }

  else if (velocityY > 0)
  {
    if (checkForWall(gameState, checkPoints.lowerLeft) || checkForWall(gameState, checkPoints.lowerRight))
    {
      velocityY = 0;
    }
  }

  newPlayerGridPosition.x = gameState.playerGridX + velocityX;
  newPlayerGridPosition.y = gameState.playerGridY + velocityY;

  return newPlayerGridPosition;
}

function checkForWall(gameState, positionVector)
{
  return positionVector.x < 0 || positionVector.x >= gameState.maze.length
    || positionVector.y < 0 || positionVector.y >= gameState.maze.length
    || gameState.maze[Math.floor(positionVector.x)][Math.floor(positionVector.y)].type === "wall";
}

function generateMazeProperties(gameState, articleProperties)
{
  return {
    title: gameState.title,
    size: Math.max(articleProperties.wordCount / 400, 10),
    simplicity: 1 / (Math.ceil(articleProperties.links.length) / 70),
    links: articleProperties.links.slice(0, Math.max(articleProperties.links.length / 10, 1)),
    treasures: articleProperties.citationsNeeded
  }
}

export default function main() {}
