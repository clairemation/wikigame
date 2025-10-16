export default function checkPlayerPositionForTreasure(gameState) {
  const treasureAcquired = isPlayerOnTreasure(gameState);
  if (treasureAcquired) {
    const treasureUpdates = {};
    treasureUpdates.score = gameState.score + 1;
    treasureUpdates.currentRoomAcquiredTreasures = [...gameState.currentRoomAcquiredTreasures, treasureAcquired];

    //todo: this is supposed to be immutable
    gameState.maze[Math.floor(gameState.playerGridX)][Math.floor(gameState.playerGridY)].type = "space";

    return treasureUpdates;
  }
}

function isPlayerOnTreasure(gameState)
{
  return (
    gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].type === 'treasure'
      ? gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].name
      : false
  );
}
