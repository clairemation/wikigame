import {windowPosToGridPos} from "./render";

let keyStatus = {};
let mouseStatus = false;
let mouseGridPos = {x:0,y:0};

export function getKeyStatus(key)
{
  return keyStatus[key];
}

export function getMouseStatus()
{
  return {mouseStatus, mouseGridPos};
}

// function start()
// {
  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  addEventListener("mousedown", processMouseClick);
// }

function stop()
{
  keyStatus = {};
  removeEventListener("keydown", onKeyDown);
  removeEventListener("keyup", onKeyUp);
  removeEventListener("mousedown", processMouseClick);
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
  }
  catch (e)
  {
    console.error(e)
  }
}
