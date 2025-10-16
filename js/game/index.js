import {render, renderInfo} from "./render";
const nmg = require('node-maze-generator');
import {viewConstants} from './view-constants.js';
import processMouseInput from "./process-mouse-input";
import processKeyInput from "./process-key-input";
import checkPlayerPositionForTreasure from "./check-player-position-for-treasure";
import createNewGameState from "./create-new-game-state";
import setupRoom from "./setup-room";

let animationFrame;

const shouldPopulateTreasures = gameState => !gameState.acquiredTreasures.find(entry => entry.room === title)

viewConstants.scoreParent.addEventListener('click', e => alert(gameState.acquiredTreasures))

start();

async function start()
{
  const gameStateProperties = {
    acquiredTreasures: [],
    currentRoomAcquiredTreasures: [],
    playerIsStillEntering: false,
    entranceName: 'bassoon',
    maze: [],
    score: 0,
    title: 'bassoon',
    playerDirectionX: 0,
    playerDirectionY: 0,
    playerSpeed: 0.05,
    playerGridX: 0,
    playerGridY: 0,
  }

  const gameState = createNewGameState({}, gameStateProperties);

  const gameStateAfterSetup = await setupRoom(gameState);
  loop(gameStateAfterSetup);
}





async function loop(gameState)
{
  const mouseUpdates = processMouseInput(gameState);
  const keyUpdates = processKeyInput(gameState);
  const treasuresUpdates = checkPlayerPositionForTreasure(gameState);

  const gameStateUpdates =
    {
    ...mouseUpdates,
    ...keyUpdates,
    ...treasuresUpdates,
  };

  const {playerIsOnExit, exitTitle} = isPlayerOnExit(gameState);
  if (playerIsOnExit)
  {
    if (gameState.currentRoomAcquiredTreasures.length > 0) {
      gameStateUpdates.acquiredTreasures = [...gameState.acquiredTreasures, {room: gameState.title, treasures: gameState.currentRoomAcquiredTreasures}];
    }

    gameStateUpdates.currentRoomAcquiredTreasures = [];
    gameStateUpdates.entranceName = gameState.title;
    gameStateUpdates.title = exitTitle;

    const newGameState = createNewGameState(gameState, gameStateUpdates);

    const newRoomGameState = await setupRoom(newGameState);
    return;
  }

  if (isPlayerOnEntrance(gameState))
  {
    if (!gameState.playerIsStillEntering)
    {
      gameStateUpdates.title = gameState.entranceName;
      gameStateUpdates.entranceName = gameState.entranceName;

      const newGameState = createNewGameState(gameState, gameStateUpdates);
      // stopAndClear();
      setupRoom(newGameState);
      return;
    }
  }
  else
  {
    gameStateUpdates.playerIsStillEntering = false;
  }

  const newGameState = createNewGameState(gameState, gameStateUpdates);

  render(newGameState);
  animationFrame = requestAnimationFrame(() => loop(newGameState));
}

function isPlayerOnExit(gameState)
{
  const cell = gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))];
  const playerIsOnExit = cell.type === "exit"
  const exitTitle = cell.title;
  return {playerIsOnExit, exitTitle};
}

function isPlayerOnEntrance(gameState)
{
  return gameState.maze[Math.floor(Math.max(gameState.playerGridX, 0))][Math.floor(Math.max(gameState.playerGridY, 0))].type === 'entrance';
}

export default function main() {}
