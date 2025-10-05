const nmg = require('node-maze-generator');
const {getArticleProperties} = require('../wiki-api/midlevelmanager.mjs');

const linkInfoParent = document.querySelector('#linkinfo')
const ctx = document.querySelector('canvas').getContext('2d');

const CELL_WIDTH = 60, CELL_HEIGHT = 60;
const WINDOW_WIDTH = 800, WINDOW_HEIGHT = 800;

let maze;
let directionX = 0, directionY = 0;
let windowX = 0, windowY = 0;
let speed = 0.05;
let keyStatus = {}
let playerX = 0, playerY = 0;
let exitsAreOpen = false;
let positionToLinkName = {}

start();

async function start()
{
  addEventListener("keydown", e => keyStatus[e.key] = true);
  addEventListener("keyup", e => keyStatus[e.key] = false);

  addEventListener("mousedown", processMouseClick);

  // const articleProperties = await getArticleProperties("bassoon");
  // const mazeProperties = generateMazeProperties(articleProperties);
  const mazeProperties = {size: 20, simplicity: 0.6, links: ["one", "two", "three"]}
  setupMaze(mazeProperties);
  requestAnimationFrame(loop);
}

function loop()
{
  requestAnimationFrame(loop);

  setPlayerDirection();

  ctx.clearRect(windowX, windowY, WINDOW_WIDTH, WINDOW_HEIGHT);

  ctx.setTransform(1, 0, 0, 1, -windowX, -windowY);
  render();

}

function processMouseClick(e)
{
  const clickGridPositionX = Math.floor((e.clientX + windowX) / CELL_WIDTH);
  const clickGridPositionY = Math.floor((e.clientY + windowY) / CELL_HEIGHT)

  if (maze[clickGridPositionX][clickGridPositionY] === "exit")
  {
    linkInfoParent.innerHTML = positionToLinkName[clickGridPositionX][clickGridPositionY];
  }
}

function setPlayerDirection()
{
  console.log(Math.floor(playerX), Math.floor(playerY));

  directionX = 0;
  directionY = 0;
  if (keyStatus['w']) directionY--;
  if (keyStatus['a']) directionX--;
  if (keyStatus['s']) directionY++;
  if (keyStatus['d']) directionX++;

  let newX = playerX + directionX * speed;
  let newY = playerY + directionY * speed;

  // wall hit collision

  // if (directionX < 0 && (maze[Math.floor(newY)][Math.floor(newX - 1)] === "wall"))
  //   newX = playerX;
  // if (directionX > 0 && (maze[Math.floor(newY)][Math.floor(newX) + 1] === "wall"))
  //   newX = playerX;
  // if (directionY < 0 && maze[Math.floor(newY - 1)][Math.floor(newX)] === "wall")
  //   newY = playerY;
  // if (directionY > 0 && maze[Math.floor(newY + 1)][Math.floor(newX)] === "wall")
  //   newY = playerY;

  playerX = newX;
  playerY = newY;

  windowX = playerX * CELL_WIDTH + CELL_WIDTH / 2 - WINDOW_WIDTH / 2;
  windowY = playerY * CELL_HEIGHT + CELL_HEIGHT / 2 - WINDOW_HEIGHT / 2;
}

function generateMazeProperties(articleProperties)
{
  return {
    size: articleProperties.wordCount / 100,
    simplicity: 1 / (articleProperties.wordCount / 3000),
    links: articleProperties.links.slice(0, Math.min(articleProperties.links.length / 100, 1)),
  }
}

function setupMaze(properties)
{
  const generator = new nmg.generators.maze({}, {width: properties.size, height: properties.size});
  maze = generator.data.grid.cells[0].map(row =>
    row.map(cell => cell.blocked ? "wall" : "space")
  )
  openUpMaze(properties.simplicity);

  const usableBorderTiles = getUsableBorderTiles();

  createEntrance(usableBorderTiles);
  createExits(properties.links, usableBorderTiles);
}

function openUpMaze(simplicity)
{
  for (let i = 0 ; i < maze.length ; i++)
  {
    for (let j = 0 ; j < maze[i].length ; j++)
    {
      const cell = maze[i][j];
      if (cell === "wall" && i > 0 && j > 0 && i < maze.length - 1 && j < maze.length - 1 && Math.random() < simplicity)
      {
        maze[i][j] = "space";
      }
    }
  }
}

function getUsableBorderTiles()
{
  const usableBorderTiles = []

  // top
  for (let i = 0 ; i < maze.length ; i++)
  {
    if (maze[i][0] === "wall" && maze[i][1] === "space")
        usableBorderTiles.push({x: i, y: 0});
  }

  // bottom
  for (let i = 0 ; i < maze.length ; i++)
  {
    if (maze[i][maze.length - 1] === "wall" && maze[i][maze.length - 2] === "space")
      usableBorderTiles.push({x: i, y: maze.length -1});
  }

  // left, minus top and bottom
  for (let i = 1 ; i < maze.length -1  ; i++)
  {
    if (maze[0][i] === "wall" && maze[1][i] === "space")
      usableBorderTiles.push({x: 0, y: i});
  }

  //right, minus top and bottom
  for (let i = 1 ; i < maze.length -1  ; i++)
  {
    if (maze[maze.length - 1][i] === "wall" && maze[maze.length - 2][i] === "space")
      usableBorderTiles.push({x: maze.length - 1, y: i});
  }

  return usableBorderTiles;
}

function createEntrance(usableBorderTiles)
{
  const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

  const pos = usableBorderTiles[index];

  usableBorderTiles.splice(index, 1);

  maze[pos.x][pos.y] = "entrance";

  playerX = pos.x;
  playerY = pos.y;
}

function createExits(links, usableBorderTiles)
{
  for (let i = 0 ; i < links.length ; i++)
  {
    const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

    const pos = usableBorderTiles[index];

    usableBorderTiles.splice(index, 1);

    maze[pos.x][pos.y] = "exit";

    if (!positionToLinkName[pos.x])
      positionToLinkName[pos.x] = []
    positionToLinkName[pos.x][pos.y] = links[i];
  }
}

function render()
{
  renderMaze();
  renderPlayer();
}

function renderPlayer()
{
  renderCell(playerX, playerY, "red");
}

function renderMaze()
{
  for (let i = 0 ; i < maze.length ; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === "wall")
        renderCell(i, j, "green");
      else if (maze[i][j] === "exit" && exitsAreOpen)
      {
        renderCell(i, j, "yellow");
      }
    }
  }
}

function renderCell(i, j, color)
{
  ctx.fillStyle = color;
  ctx.fillRect(i * CELL_WIDTH, j * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

}

export default function main() {}
