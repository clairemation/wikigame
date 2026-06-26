import {getMouseStatus} from "./input";
import {viewConstants} from "./view-constants";

export default function processMouseInput(gameState)
{
  let mouseUpdates = {};

  const {mouseStatus, mouseGridPos, mouseTarget} = getMouseStatus();

  if (mouseTarget === viewConstants.scoreParent)
  {
    // console.log(gameState);
  }
  else {
    if (mouseStatus && mouseGridPos.x >= 0 && mouseGridPos.y >= 0 && mouseGridPos.x < gameState.maze.length && mouseGridPos.y < gameState.maze.length) {
      const {name, type, title} = gameState.maze[mouseGridPos.x][mouseGridPos.y];
      if (type === "exit") {
        mouseUpdates.renderedInfo = title;
      } else if (type === "treasure") {
        mouseUpdates.renderedInfo = name;
      } else if (type === "entrance") {
        mouseUpdates.renderedInfo = gameState.entranceName;
      }
      else {
        mouseUpdates.renderedInfo = "Mouse over a doorway or gem to see more info"
      }
    }
  }

  return mouseUpdates;
}
