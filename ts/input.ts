export const enum Direction {
  Up    = 0,
  Right = 1,
  Down  = 2,
  Left  = 3
}

const KeyMap: {[key: string]: Direction} = Object.freeze({
  'w': Direction.Up,
  'arrowup': Direction.Up,

  'd': Direction.Right,
  'arrowright': Direction.Right,

  's': Direction.Down,
  'arrowdown': Direction.Down,

  'a': Direction.Left,
  'arrowleft': Direction.Left,
})

export const Opposite: {[direction in Direction]: Direction} = Object.freeze({
  [Direction.Up   ]: Direction.Down,
  [Direction.Right]: Direction.Left,
  [Direction.Down ]: Direction.Up,
  [Direction.Left ]: Direction.Right,
})

type DirectionUpdate = (direction: Direction) => void
export const subscribeToInput = (element: HTMLElement, update: DirectionUpdate) => {

  const listener = (event: KeyboardEvent) => {

    const key = event.key.toLowerCase()
    if(!(key in KeyMap)) return

    const direction = KeyMap[key]
    update(direction)

  }

  element.addEventListener('keydown', listener)
  return () => {
    element.removeEventListener('keydown', listener)
  }
}
