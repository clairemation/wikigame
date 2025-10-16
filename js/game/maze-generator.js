const nmg = require("node-maze-generator");

export default function generateMaze(properties)
{
  const generator = new nmg.generators.maze({}, {width: properties.size, height: properties.size});
  const maze = generator.data.grid.cells[0].map(row =>
    row.map(cell => cell.blocked ? {type: "wall", x: cell.x, y: cell.y} : {type: "space", x: cell.x, y: cell.y})
  )
  openUpMazeInPlace(maze, properties.simplicity);

  const usableBorderTiles = getUsableBorderTiles(maze);

  createEntranceInPlace(maze, usableBorderTiles);
  createExitsInPlace(maze, properties.links, usableBorderTiles);
  // if (shouldPopulateTreasures(gameState))
  createTreasuresInPlace(maze, properties.treasures);

  return maze
}

function openUpMazeInPlace(maze, simplicity)
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

function getUsableBorderTiles(maze)
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

function createEntranceInPlace(maze, usableBorderTiles)
{
  const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

  const pos = usableBorderTiles[index];

  usableBorderTiles.splice(index, 1);

  maze[pos.x][pos.y].type = "entrance";
}

function createExitsInPlace(maze, links, usableBorderTiles)
{
  for (let i = 0 ; i < links.length && i < usableBorderTiles.length ; i++)
  {
    const index = Math.max(0, Math.floor(Math.random() * usableBorderTiles.length - 1));

    const pos = usableBorderTiles[index];

    usableBorderTiles.splice(index, 1);

    maze[pos.x][pos.y].type = "exit";
    maze[pos.x][pos.y].title = links[i];

    // if (!gameState.positionToLinkName[pos.x])
    //   gameState.positionToLinkName[pos.x] = []
    // gameState.positionToLinkName[pos.x][pos.y] = links[i];
  }
}

function createTreasuresInPlace(maze, citesNeeded)
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
