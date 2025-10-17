import {render} from "./render";
const nmg = require('node-maze-generator');
import processMouseInput from "./process-mouse-input";
import processKeyInput from "./process-key-input";
import checkPlayerPositionForTreasure from "./check-player-position-for-treasure";
import createNewGameState from "./create-new-game-state";
import setupRoom from "./setup-room";
import checkPlayerPositionForExit from "./check-player-position-for-exit";
import checkPlayerPositionForEntrance from "./check-player-position-for-entrance";

let animationFrame;

const shouldPopulateTreasures = gameState => !gameState.acquiredTreasures.find(entry => entry.room === title)

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
  const positionUpdates = checkPlayerPositionForTreasure(gameState)
    || await checkPlayerPositionForExit(gameState)
    || await checkPlayerPositionForEntrance(gameState);

  const gameStateUpdates =
    {
    ...mouseUpdates,
    ...keyUpdates,
    ...positionUpdates
  };

  const newGameState = createNewGameState(gameState, gameStateUpdates);

  render(newGameState);

  animationFrame = requestAnimationFrame(() => loop(newGameState));
}

export default function main() {}
