import {render} from "./render";
import processMouseInput from "./process-mouse-input";
import processKeyInput from "./process-key-input";
import checkPlayerPositionForTreasure from "./check-player-position-for-treasure";
import createNewGameState from "./create-new-game-state";
import setupRoom from "./setup-room";
import checkPlayerPositionForExit from "./check-player-position-for-exit";
import checkPlayerPositionForEntrance from "./check-player-position-for-entrance";
import getRandomArticleName from "./helpers/wiki";
import {viewConstants} from "./view-constants";

let animationFrame;

const shouldPopulateTreasures = gameState => !gameState.acquiredTreasures.find(entry => entry.room === title)

start();

async function start()
{
  const randomTitle = await getRandomArticleName();

  const gameStateProperties = {
    acquiredTreasures: [],
    playerIsStillEntering: false,
    entranceName: randomTitle,
    maze: [],
    score: 0,
    title: randomTitle,
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
  try {
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
  catch (error)
  {
    viewConstants.modalParent.classList.remove("hidden");
    viewConstants.treasureListParent.innerHTML = `
      ${gameState.acquiredTreasures.map(e => "<li>" + e + "</li>")}
    `
  }
}

export default function main() {}
