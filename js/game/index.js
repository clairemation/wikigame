const nmg = require('node-maze-generator');
const {getArticleProperties} = require('../wiki-api/midlevelmanager.mjs');

const ctx = document.querySelector('canvas').getContext('2d');

const CELL_WIDTH = 60, CELL_HEIGHT = 60;
const WINDOW_WIDTH = 800, WINDOW_HEIGHT = 800;

let maze;
let directionX = 0, directionY = 0;
let windowX = 0, windowY = 0;
let speed = 0.05;
let keyStatus = {}
let deltaTime = 0;
let playerX = 0, playerY = 0;

start();

function loop()
{
  // draw state
  // get input
  // update state
  // return new state

  requestAnimationFrame(loop);

  setPlayerDirection();

  ctx.clearRect(windowX, windowY, WINDOW_WIDTH, WINDOW_HEIGHT);

  ctx.setTransform(1, 0, 0, 1, -windowX, -windowY);
  render();

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

  // if (directionX < 0 && (maze[Math.floor(newX)][Math.floor(playerY)] === "wall"))
  //   newX = playerX;
  // if (directionX > 0 && (maze[Math.ceil(newX)][Math.floor(playerY)] === "wall"))
  //   newX = playerX;
  // if (directionY < 0 && maze[Math.floor(playerX)][Math.floor(newY)] === "wall")
  //   newY = playerY;
  // if (directionY > 0 && maze[Math.floor(playerX)][Math.ceil(newY)] === "wall")
  //   newY = playerY;

  playerX = newX;
  playerY = newY;

  windowX = playerX * CELL_WIDTH + CELL_WIDTH / 2 - WINDOW_WIDTH / 2;
  windowY = playerY * CELL_HEIGHT + CELL_HEIGHT / 2 - WINDOW_HEIGHT / 2;

  console.log(windowX, windowY);
}

async function start()
{
  addEventListener("keydown", e => keyStatus[e.key] = true);
  addEventListener("keyup", e => keyStatus[e.key] = false);
  requestAnimationFrame(loop);

  // const articleProperties = await getArticleProperties("bassoon");
  // const mazeProperties = generateMazeProperties(articleProperties);
  const mazeProperties = {size: 20, simplicity: 0.6}
  setupMaze(mazeProperties);
  requestAnimationFrame(loop);
}

function generateMazeProperties(articleProperties)
{
  return {
    size: articleProperties.wordCount / 100,
    simplicity: 1 / (articleProperties.wordCount / 3000)
  }
}

function setupMaze(properties)
{
  const generator = new nmg.generators.maze({}, {width: properties.size, height: properties.size});
  maze = generator.data.grid.cells[0].map(row =>
    row.map(cell => cell.blocked ? "wall" : "space")
  )
  openUpMaze(properties.simplicity);
  createEntrance();
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

function createEntrance(side = -1)
{
  if (side === -1)
  {
    const startTile = Math.floor((Math.random() * (maze.length - 1)));

    for (let i = 0 ; i < maze.length ; i++)
    {
      const currentTile = (startTile + i) % (maze.length - 1);
      if (maze[currentTile][0] === "wall" && maze[currentTile][1] === "space")
      {
        maze[currentTile][0] = "entrance"
        playerX = currentTile;
        playerY = 0;
        return;
      }
    }
  }
}

function render()
{
  renderMaze();
  renderPlayer();
}

function renderPlayer()
{
  ctx.fillStyle = "red";
  ctx.fillRect(playerX * CELL_WIDTH, playerY * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
}

function renderMaze()
{
  for (let i = 0 ; i < maze.length ; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === "wall")
        renderWallCell(i, j);
    }
  }

  function renderWallCell(i, j)
  {
    ctx.fillStyle = "green";
    ctx.fillRect(i * CELL_WIDTH - 1, j * CELL_HEIGHT - 1, CELL_WIDTH + 1, CELL_HEIGHT + 1);

  }
}

export default function main() {}
