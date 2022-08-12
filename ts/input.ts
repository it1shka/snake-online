export enum Direction {
  Up    = 'Up',
  Right = 'Right',
  Down  = 'Down',
  Left  = 'Left'
}

export const enum DirectionCode {
  Up = 0, Right = 1, Down = 2, Left = 3
}

export const DirectionToCodeMap: {[d in Direction]: DirectionCode} = {
  Up: DirectionCode.Up,
  Right: DirectionCode.Right,
  Down: DirectionCode.Down,
  Left: DirectionCode.Left,
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

type DirChangeHandler = (direction: Direction) => boolean

export const subscribeToInput = (element: HTMLElement, onchange: DirChangeHandler) => {
  let last: Direction | null = null

  const listener = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if(!(key in KeyMap)) return

    const direction = KeyMap[key]
    if(direction == last) return

    const shouldUpdate = onchange(direction)
    if(shouldUpdate) last = direction
  }

  element.addEventListener('keydown', listener)

  return listener
}
