export default function checkPlayerPositionForTreasure(gameState) {
  const treasureAcquired = isPlayerOnTreasure(gameState);
  if (treasureAcquired) {
    const treasureUpdates = {};
    treasureUpdates.score = gameState.score + 1;
    treasureUpdates.acquiredTreasures = [...gameState.acquiredTreasures, `${gameState.title}: ${treasureAcquired}`]

    //todo: maze state is supposed to be immutable
    gameState.maze[Math.floor(gameState.playerGridX + 0.5)][Math.floor(gameState.playerGridY + 0.5)].type = "space";

    return treasureUpdates;
  }
}

function isPlayerOnTreasure(gameState)
{
  return (
    gameState.maze[Math.floor(Math.max(gameState.playerGridX + 0.5, 0))][Math.floor(Math.max(gameState.playerGridY + 0.5, 0))].type === 'treasure'
      ? gameState.maze[Math.floor(Math.max(gameState.playerGridX + 0.5, 0))][Math.floor(Math.max(gameState.playerGridY + 0.5, 0))].name
      : false
  );
}
