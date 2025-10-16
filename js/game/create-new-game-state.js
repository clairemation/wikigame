export default function createNewGameState(gameState, newProperties)
{
  const newGameState = {...gameState, ...newProperties};
  Object.freeze(newGameState);
  return newGameState;
}
