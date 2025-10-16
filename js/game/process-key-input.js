import {getKeyStatus} from "./input";

export default function processKeyInput(gameState)
{
  let playerDirectionX = 0, playerDirectionY = 0;

  if (getKeyStatus('w')) playerDirectionY--;
  if (getKeyStatus('a')) playerDirectionX--;
  if (getKeyStatus('s')) playerDirectionY++;
  if (getKeyStatus('d')) playerDirectionX++;

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

  return {playerGridX: gameState.playerGridX + velocityX, playerGridY: gameState.playerGridY + velocityY };
}

function checkForWall(gameState, positionVector)
{
  return positionVector.x < 0 || positionVector.x >= gameState.maze.length
    || positionVector.y < 0 || positionVector.y >= gameState.maze.length
    || gameState.maze[Math.floor(positionVector.x)][Math.floor(positionVector.y)].type === "wall";
}
