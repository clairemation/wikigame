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

let running = true;
let animationFrame;
let lastTime = Date.now();
let elapsedTime = 0;

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || "asdf";

document.querySelector("#restart-button").addEventListener("click", () => {
  viewConstants.modalParent.classList.add("hidden");
  restart();
})

restart();

async function restart()
{
  cancelAnimationFrame(animationFrame);

  let randomTitle;

  if (mode === "curated")
  {
    randomTitle = getRandomArticleNameFromList(); //getRandomArticleName();
  }
  else
  {
    randomTitle = await getRandomArticleName();
  }

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
  if (gameState.timeRemaining <= 0)
  {
    stopGame(gameState, "Time's up!");
    return;
  }

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
    stopGame(gameState, "Red link!");
  }
}

function updateTime(gameState)
{
  let currentTime = Date.now();
  let dt = currentTime - lastTime;
  lastTime = currentTime;

  let newTimeRemaining = Math.max(gameState.timeRemaining - dt, 0)

  let gameStateUpdate = {timeRemaining: newTimeRemaining};

  return gameStateUpdate;

}

function stopGame(gameState, eventText)
{
  document.querySelector("#modal h1").innerHTML = eventText
  viewConstants.modalParent.classList.remove("hidden");
  viewConstants.treasureListParent.innerHTML = `${gameState.acquiredTreasures.map(e => "<li>" + e + "</li>").join("")}`
}

function getRandomArticleNameFromList()
{
  let list = [
    "Geneva",
    "Landed gentry",
    "Suffrage",
    "Auxiliary verb",
    "Malware",
    "mathematics",
    "Mathematician",
    "University of Iceland",
    "Ancient Carthage",
    "Africa"
  ]

  let index = Math.floor(Math.random() * (list.length - 1));
  return list[index];
}

export default function main() {}
