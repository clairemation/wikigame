import createNewGameState from "./create-new-game-state";
import setupRoom from "./setup-room";

export default async function checkPlayerPositionForEntrance(gameState) {
  const entranceUpdates = {}
  if (isPlayerOnEntrance(gameState)) {
    if (!gameState.playerIsStillEntering) {
      entranceUpdates.title = gameState.entranceName;
      entranceUpdates.entranceName = gameState.entranceName;

      const newGameState = createNewGameState(gameState, entranceUpdates);
      // stopAndClear();
      const newRoomState = await setupRoom(newGameState);
      return newRoomState;
    }
  } else {
    entranceUpdates.playerIsStillEntering = false;
    return entranceUpdates;
  }
}

function isPlayerOnEntrance(gameState)
{
  return gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].type === 'entrance';
}
