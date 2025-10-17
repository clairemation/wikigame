import {viewConstants as gameState, viewConstants} from "./view-constants";

const CELL_WIDTH = 60, CELL_HEIGHT = 60;
const WINDOW_WIDTH = 800, WINDOW_HEIGHT = 800;
const viewState = {
  windowX: 0,
  windowY: 0,
}

let priorGameState = {};

let ready = false;

let frameNum = 1;

const images = {
  "wall": new Image(),
  "chara1": new Image(),
  "chara2": new Image(),
  "entrance": new Image(),
  "exit": new Image(),
  "treasure": new Image()
}

loadAllImages();
setInterval(flipFrameNumber, 250);

async function loadAllImages()
{
  const imageNames = ["wall", "chara1", "chara2", "entrance", "exit", "treasure"];
  const imagePromises = [];
  for (let imageName of imageNames)
  {
    const image = images[imageName];
    imagePromises.push(new Promise((resolve) => image.addEventListener("load", resolve)))
    image.src = `../img/${imageName}.png`;
  }

  await Promise.all(imagePromises);
  ready = true;
}

export function render(gameState)
{
  if (!ready) return;

  // if (gameState.playerGridX !== priorGameState.playerGridX
  // || gameState.playerGridY !== priorGameState.playerGridY)
  // {
    viewConstants.ctx.clearRect(viewState.windowX, viewState.windowY, WINDOW_WIDTH, WINDOW_HEIGHT);
    viewState.windowX = gameState.playerGridX * CELL_WIDTH + CELL_WIDTH / 2 - WINDOW_WIDTH / 2;
    viewState.windowY = gameState.playerGridY * CELL_HEIGHT + CELL_HEIGHT / 2 - WINDOW_HEIGHT / 2;
    viewConstants.ctx.setTransform(1, 0, 0, 1, -viewState.windowX, -viewState.windowY);
    renderMaze(gameState);
    renderPlayer(gameState);
  // }

  renderInfo(gameState);

  priorGameState = gameState;
}

export function renderInfo(gameState)
{
  if (gameState.renderedInfo && gameState.renderedInfo !== priorGameState.renderedInfo)
    viewConstants.linkInfoParent.innerText = gameState.renderedInfo;

  if (gameState.score !== priorGameState.score)
  {
    viewConstants.scoreParent.innerText = gameState.score;
  }
}

export function windowPosToGridPos(windowPosX, windowPosY)
{
  const gridPositionX = Math.floor((windowPosX - viewConstants.canvas.clientLeft + viewState.windowX) / CELL_WIDTH);
  const gridPositionY = Math.floor((windowPosY - viewConstants.canvas.clientTop + viewState.windowY) / CELL_HEIGHT)
  return ({x: gridPositionX, y: gridPositionY});
}

function renderPlayer(gameState)
{
  renderPlayerCell(gameState.playerGridX, gameState.playerGridY, "blue");
}

function renderMaze(gameState)
{
  for (let i = 0 ; i < gameState.maze.length ; i++) {
    for (let j = 0; j < gameState.maze[i].length; j++) {
      const cell = gameState.maze[i][j];
      if (cell.type !== "space")
      {
        renderCell(i, j, cell.type);
      }
    }
  }
}

function renderCell(x, y, cellType)
{
  viewConstants.ctx.drawImage(images[cellType], 0, 0, 100, 100, x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_HEIGHT);
}

function renderPlayerCell(x, y, color)
{

  if (frameNum === 1)
  {
    viewConstants.ctx.drawImage(images.chara1, 0, 0, 100, 100, x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_HEIGHT);
  }
  else
  {
    viewConstants.ctx.drawImage(images.chara2, 100, 0, -100, 100, x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_HEIGHT);
  }
}

function flipFrameNumber()
{
  frameNum = (frameNum + 1) % 2
}

