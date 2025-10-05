const nmg = require('node-maze-generator');
const {getArticleProperties} = require('../wiki-api/midlevelmanager.mjs');

const ctx = document.querySelector('canvas').getContext('2d');

let maze;
let directionX = 0, directionY = 0;
let windowX = 0, windowY = 0;
let speed = 2.5;
let keyStatus = {}
let deltaTime = 0;

start();

function loop()
{
  // draw state
  // get input
  // update state
  // return new state

  requestAnimationFrame(loop);

  setDirection();

  ctx.clearRect(windowX, windowY, 800, 800);
  const translationX = directionX * speed;
  const translationY = directionY * speed;
  windowX += translationX;
  windowY += translationY;
  ctx.translate(-translationX, -translationY);
  renderMaze(maze);

}

function setDirection()
{
  directionX = 0;
  directionY = 0;
  if (keyStatus['w']) directionY--;
  if (keyStatus['a']) directionX--;
  if (keyStatus['s']) directionY++;
  if (keyStatus['d']) directionX++;
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
      const currentTile = startTile + i % maze.length;
      if (maze[currentTile][0] === "wall" && maze[currentTile][1] === "space")
      {
        maze[currentTile][0] = "entrance"
        return;
      }
    }

  }
}

function renderMaze(maze)
{
  for (let i = 0 ; i < maze.length ; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === "wall")
        renderWallCell(i, j);
    }
  }

  function renderWallCell(i, j)
  {
    const WIDTH = 60, HEIGHT = 60;

    ctx.fillStyle = "green";
    ctx.fillRect(i * WIDTH - 1, j * HEIGHT - 1, WIDTH + 1, HEIGHT + 1);

  }
}

export default function main() {}
