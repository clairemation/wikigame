export const KEY_DOWN_UP = 0;
export const KEY_DOWN_LEFT = 1;
export const KEY_DOWN_DOWN = 2;
export const KEY_DOWN_RIGHT = 3;

let lastUsedIndex = 0;
const queue = [];

export function enqueue(event)
{
  queue[lastUsedIndex++] = event;
}

export function read(func)
{
  for (let i = 0; i < lastUsedIndex; i++)
  {
    func(queue[i]);
  }
}

export function clear()
{
  lastUsedIndex = 0;
}
