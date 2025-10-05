const nmg = require('node-maze-generator');
const {getArticleProperties} = require('../wiki-api/midlevelmanager.mjs');

const scoreParent = document.querySelector('#score');
const roomTitleParent = document.querySelector('#roomtitle')
const linkInfoParent = document.querySelector('#linkinfo')
const ctx = document.querySelector('canvas').getContext('2d');

const CELL_WIDTH = 60, CELL_HEIGHT = 60;
const WINDOW_WIDTH = 800, WINDOW_HEIGHT = 800;

let acquiredTreasures = [];
let currentRoomAcquiredTreasures = [];
let playerIsStillEntering = false;
let shouldPopulateTreasures = true;
let entranceName = 'bassoon';
let animationFrame;
let maze;
let score = 0;
let title = 'bassoon';
let directionX = 0, directionY = 0;
let windowX = 0, windowY = 0;
let speed = 0.05;
let keyStatus = {}
let playerGridX = 0, playerGridY = 0;
let exitsAreOpen = false;
let positionToLinkName = {}

start();


async function start()
{
  const articleProperties = await getArticleProperties(title);
  const mazeProperties = generateMazeProperties(articleProperties);
  // const mazeProperties = {
  //   title: 'default',
  //   size: 20,
  //   simplicity: 0.6,
  //   links: ["one", "two", "three"],
  //   treasures: ["blah blah", "woof woof", "asdf asdf", "fdsa fdsa"]
  // }
  setupMaze(mazeProperties);
  playerIsStillEntering = true;

  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  addEventListener("mousedown", processMouseClick);

  roomTitleParent.innerText = mazeProperties.title;

  animationFrame = requestAnimationFrame(loop);
}

function clear()
{
  cancelAnimationFrame(animationFrame);
  directionX = 0;
  directionY = 0;
  keyStatus = {};
  removeEventListener("keydown", onKeyDown);
  removeEventListener("keyup", onKeyUp);
  removeEventListener("mousedown", processMouseClick);
  ctx.clearRect(windowX, windowY, WINDOW_WIDTH, WINDOW_HEIGHT);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function onKeyDown(e)
{
  keyStatus[e.key] = true
}

function onKeyUp(e)
{
  keyStatus[e.key] = false;
}

function loop()
{
  animationFrame = requestAnimationFrame(loop);

  setPlayerPosition();

  const treasureAcquired = isPlayerOnTreasure();
  if (treasureAcquired)
  {
    score++;
    currentRoomAcquiredTreasures.push(treasureAcquired)
    scoreParent.innerText = score;
    maze[Math.floor(playerGridX)][Math.floor(playerGridY)].type = "space"
  }

  if (isPlayerOnExit())
  {
    const treasuresFromRoom = {room: title, treasures: currentRoomAcquiredTreasures.splice(0)};
    acquiredTreasures.push(treasuresFromRoom);
    currentRoomAcquiredTreasures = [];
    entranceName = title;
    title = positionToLinkName[Math.floor(playerGridX)][Math.floor(playerGridY)];
    shouldPopulateTreasures = true;
    clear();
    start();
    console.log(acquiredTreasures);
  }

  if (isPlayerOnEntrance())
  {
    if (!playerIsStillEntering)
    {
      let temp = entranceName;
      title = entranceName;
      entranceName = temp;
      shouldPopulateTreasures = false
      clear();
      start();
    }
  }
  else
  {
    playerIsStillEntering = false;
  }

  ctx.clearRect(windowX, windowY, WINDOW_WIDTH, WINDOW_HEIGHT);

  ctx.setTransform(1, 0, 0, 1, -windowX, -windowY);
  render();

}

function isPlayerOnExit()
{
  return maze[Math.floor(Math.max(playerGridX, 0))][Math.floor(Math.max(playerGridY, 0))].type === 'exit';
}

function isPlayerOnTreasure()
{
  return (
    maze[Math.floor(Math.max(playerGridX, 0))][Math.floor(Math.max(playerGridY, 0))].type === 'treasure' ?
      maze[Math.floor(Math.max(playerGridX, 0))][Math.floor(Math.max(playerGridY, 0))].name : false
  );
}

function isPlayerOnEntrance()
{
  return maze[Math.floor(Math.max(playerGridX, 0))][Math.floor(Math.max(playerGridY, 0))].type === 'entrance';
}

function processMouseClick(e)
{
  try {
    const clickGridPositionX = Math.floor((e.clientX - e.target.clientLeft + windowX) / CELL_WIDTH);
    const clickGridPositionY = Math.floor((e.clientY - e.target.clientTop + windowY) / CELL_HEIGHT)

    if (maze[clickGridPositionX][clickGridPositionY].type === "exit") {
      linkInfoParent.innerText = positionToLinkName[clickGridPositionX][clickGridPositionY];
    }
    if (maze[clickGridPositionX][clickGridPositionY].type === "treasure") {
      linkInfoParent.innerText = maze[clickGridPositionX][clickGridPositionY].name;
    }
    if (maze[clickGridPositionX][clickGridPositionY].type === "entrance") {
      linkInfoParent.innerText = entranceName;
    }
  }
  catch (e)
  {
    console.log(e)
  }
}

function setPlayerPosition()
{
  directionX = 0;
  directionY = 0;
  if (keyStatus['w']) directionY--;
  if (keyStatus['a']) directionX--;
  if (keyStatus['s']) directionY++;
  if (keyStatus['d']) directionX++;

  let newX = playerGridX + directionX * speed;
  let newY = playerGridY + directionY * speed;

  // wall hit collision

  // if (directionX < 0 && (maze[Math.floor(newX)][Math.floor(newY)] === "wall"))
  //   newX = playerGridX;
  // if (directionX > 0 && (maze[Math.floor(newX)][Math.floor(newY)] === "wall"))
  //   newX = playerGridX;
  // if (directionY < 0 && maze[Math.floor(newX)][Math.floor(newY)] === "wall")
  //   newY = playerGridY;
  // if (directionY > 0 && maze[Math.floor(newX)][Math.floor(newY)] === "wall")
  //   newY = playerGridY;

  playerGridX = newX;
  playerGridY = newY;

  windowX = playerGridX * CELL_WIDTH + CELL_WIDTH / 2 - WINDOW_WIDTH / 2;
  windowY = playerGridY * CELL_HEIGHT + CELL_HEIGHT / 2 - WINDOW_HEIGHT / 2;
}

function generateMazeProperties(articleProperties)
{
  return {
    title: title,
    size: Math.max(articleProperties.wordCount / 400, 10),
    simplicity: 1 / (Math.ceil(articleProperties.links.length) / 70),
    links: articleProperties.links.slice(0, Math.max(articleProperties.links.length / 10, 1)),
    treasures: articleProperties.citationsNeeded
  }
}

function setupMaze(properties)
{
  const generator = new nmg.generators.maze({}, {width: properties.size, height: properties.size});
  maze = generator.data.grid.cells[0].map(row =>
    row.map(cell => cell.blocked ? {type: "wall", x: cell.x, y: cell.y} : {type: "space", x: cell.x, y: cell.y})
  )
  openUpMaze(properties.simplicity);

  const usableBorderTiles = getUsableBorderTiles();

  createEntrance(usableBorderTiles);
  createExits(properties.links, usableBorderTiles);
  if (shouldPopulateTreasures)
    createTreasures(properties.treasures);
}

function openUpMaze(simplicity)
{


  for (let i = 0 ; i < maze.length ; i++)
  {
    for (let j = 0 ; j < maze[i].length ; j++)
    {
      const cell = maze[i][j];
      if (cell.type === "wall" && i > 0 && j > 0 && i < maze.length - 1 && j < maze.length - 1 && Math.random() < simplicity)
      {
        maze[i][j].type = "space";
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
    if (maze[i][0].type === "wall" && maze[i][1].type === "space")
        usableBorderTiles.push({x: i, y: 0});
  }

  // bottom
  for (let i = 0 ; i < maze.length ; i++)
  {
    if (maze[i][maze.length - 1].type === "wall" && maze[i][maze.length - 2].type === "space")
      usableBorderTiles.push({x: i, y: maze.length -1});
  }

  // left, minus top and bottom
  for (let i = 1 ; i < maze.length -1  ; i++)
  {
    if (maze[0][i].type === "wall" && maze[1][i].type === "space")
      usableBorderTiles.push({x: 0, y: i});
  }

  //right, minus top and bottom
  for (let i = 1 ; i < maze.length -1  ; i++)
  {
    if (maze[maze.length - 1][i] === "wall".type && maze[maze.length - 2][i].type === "space")
      usableBorderTiles.push({x: maze.length - 1, y: i});
  }

  return usableBorderTiles;
}

function createEntrance(usableBorderTiles)
{
  const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

  const pos = usableBorderTiles[index];

  usableBorderTiles.splice(index, 1);

  maze[pos.x][pos.y].type = "entrance";

  playerGridX = pos.x;
  playerGridY = pos.y;
}

function createExits(links, usableBorderTiles)
{
  for (let i = 0 ; i < links.length ; i++)
  {
    const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

    const pos = usableBorderTiles[index];

    usableBorderTiles.splice(index, 1);

    maze[pos.x][pos.y].type = "exit";

    if (!positionToLinkName[pos.x])
      positionToLinkName[pos.x] = []
    positionToLinkName[pos.x][pos.y] = links[i];
  }
}

function createTreasures(citesNeeded)
{
  const emptySpaces = maze.flat().filter(cell => cell.type === "space");

  for (let i = 0 ; i < citesNeeded.length ; i++)
  {
    const rand = Math.floor((Math.random() * (emptySpaces.length - 1)));
    emptySpaces[rand].type = "treasure";
    emptySpaces[rand].name = citesNeeded[i];
    emptySpaces.splice(rand, 1);
  }
}

function render()
{
  renderMaze();
  renderPlayer();
}

function renderPlayer()
{
  renderCell(playerGridX, playerGridY, "blue");
}

function renderMaze()
{
  for (let i = 0 ; i < maze.length ; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j].type === "wall")
        renderCell(i, j, "green");
      else if (maze[i][j].type === "exit" && !exitsAreOpen)
      {
        renderCell(i, j, "yellow");
      }
      else if (maze[i][j].type === "entrance")
      {
        renderCell(i, j, "black");
      }
      else if (maze[i][j].type === "treasure")
      {
        renderCell(i, j, "red");
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
