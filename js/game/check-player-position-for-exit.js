import createNewGameState from "./create-new-game-state";
import setupRoom from "./setup-room";

export default async function checkPlayerPositionForExit(gameState)
{
  const {playerIsOnExit, exitTitle} = isPlayerOnExit(gameState);
  if (playerIsOnExit)
  {
    const exitUpdates = {}

    exitUpdates.entranceName = gameState.title;
    exitUpdates.title = exitTitle;

    const newGameState = createNewGameState(gameState, exitUpdates);
    const newRoomGameState = await setupRoom(newGameState);
    return newRoomGameState;
  }
}

function isPlayerOnExit(gameState)
{
  const cell = gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))];
  const playerIsOnExit = cell.type === "exit"
  const exitTitle = cell.title;
  return {playerIsOnExit, exitTitle};
}
