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
let lastTime = Date.now();
let elapsedTime = 0;

const shouldPopulateTreasures = gameState => !gameState.acquiredTreasures.find(entry => entry.room === title)

start();

async function start()
{
  const randomTitle = "humbucker"; //await getRandomArticleName();

  const gameStateProperties = {
    timeRemaining: 2 * 60000, //2 minutes
    acquiredTreasures: [],
    playerIsStillEntering: false,
    entranceName: randomTitle,
    maze: [],
    score: 0,
    title: randomTitle,
    playerDirectionX: 0,
    playerDirectionY: 0,
    playerSpeed: 3.5,
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
    const timeUpdates = updateTime(gameState);
    const mouseUpdates = processMouseInput(gameState);
    const keyUpdates = processKeyInput(gameState);
    const positionUpdates = checkPlayerPositionForTreasure(gameState) //TODO: combine position checks
      || await checkPlayerPositionForExit(gameState)
      || await checkPlayerPositionForEntrance(gameState);

    const gameStateUpdates =
      {
        ...timeUpdates,
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
    console.log(error);
    viewConstants.modalParent.classList.remove("hidden");
    viewConstants.treasureListParent.innerHTML = `
      ${gameState.acquiredTreasures.map(e => "<li>" + e + "</li>")}
    `
  }
}

function updateTime(gameState)
{
  let currentTime = Date.now();
  let dt = currentTime - lastTime;
  lastTime = currentTime;

  let gameStateUpdate = {timeRemaining: gameState.timeRemaining - dt};

  return gameStateUpdate;

}

export default function main() {}
