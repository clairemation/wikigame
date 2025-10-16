import {viewConstants as gameState, viewConstants} from "./view-constants";

const CELL_WIDTH = 60, CELL_HEIGHT = 60;
const WINDOW_WIDTH = 800, WINDOW_HEIGHT = 800;
const viewState = {
  windowX: 0,
  windowY: 0,
}

let priorGameState = {};

export function render(gameState)
{
  if (gameState.playerGridX !== priorGameState.playerGridX
  || gameState.playerGridY !== priorGameState.playerGridY)
  {
    viewConstants.ctx.clearRect(viewState.windowX, viewState.windowY, WINDOW_WIDTH, WINDOW_HEIGHT);
    viewState.windowX = gameState.playerGridX * CELL_WIDTH + CELL_WIDTH / 2 - WINDOW_WIDTH / 2;
    viewState.windowY = gameState.playerGridY * CELL_HEIGHT + CELL_HEIGHT / 2 - WINDOW_HEIGHT / 2;
    viewConstants.ctx.setTransform(1, 0, 0, 1, -viewState.windowX, -viewState.windowY);
    renderMaze(gameState);
    renderPlayer(gameState);
  }

  renderInfo(gameState);

  priorGameState = gameState;
}

export function renderInfo(gameState)
{
  if (gameState.renderedInfo && gameState.renderedInfo !== priorGameState.renderedInfo)
    viewConstants.linkInfoParent.innerText = gameState.renderedInfo;
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
      if (gameState.maze[i][j].type === "wall")
        renderCell(i, j, "green");
      else if (gameState.maze[i][j].type === "exit" && !gameState.exitsAreOpen)
      {
        renderCell(i, j, "yellow");
      }
      else if (gameState.maze[i][j].type === "entrance")
      {
        renderCell(i, j, "black");
      }
      else if (gameState.maze[i][j].type === "treasure")
      {
        renderCell(i, j, "red");
      }
    }
  }
}

function renderCell(i, j, color)
{
  viewConstants.ctx.fillStyle = color;
  viewConstants.ctx.fillRect(i * CELL_WIDTH, j * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
}

function renderPlayerCell(x, y, color)
{
  viewConstants.ctx.fillStyle = color;
  viewConstants.ctx.fillRect(x * CELL_WIDTH + 10, y * CELL_HEIGHT + 10, CELL_WIDTH - 20, CELL_HEIGHT -20);
}
