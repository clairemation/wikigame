import {windowPosToGridPos} from "./render";

let keyStatus = {};
let mouseStatus = false;
let mouseGridPos = {x:0,y:0};
let mouseTarget;

export function getKeyStatus(key)
{
  return keyStatus[key];
}

export function getMouseStatus()
{
  return {mouseStatus, mouseGridPos, mouseTarget};
}

// function start()
// {
  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  addEventListener("mousedown", processMouseClick);
  addEventListener("mouseup", processMouseUp);
// }

function stop()
{
  keyStatus = {};
  removeEventListener("keydown", onKeyDown);
  removeEventListener("keyup", onKeyUp);
  removeEventListener("mousedown", processMouseClick);
  removeEventListener("mouseup", processMouseUp);
}

function onKeyDown(e)
{
  keyStatus[e.key] = true
}

function onKeyUp(e)
{
  keyStatus[e.key] = false;
}

function processMouseClick(e)
{
  try {
    mouseStatus = true;
    mouseGridPos = windowPosToGridPos(e.clientX, e.clientY);
    mouseTarget = e.target;
  }
  catch (e)
  {
    console.error(e)
  }
}

function processMouseUp(e)
{
  mouseStatus = false;
  mouseTarget = null;
}
