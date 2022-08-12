import { Direction, Opposite, subscribeToInput } from "./input.js";
import RecordManager from "./recordmanager.js";
import { choose } from "./utils.js";
import { Position, Snake } from "./visualizer.js";

export default class OfflineSnake implements Snake {

  public headColor = 'red'
  public tailColor = 'orange'
  public body: Position[]

  public food!: Position

  private direction = Direction.Up
  private lastDirection = Direction.Up

  private boardSize: number
  private unsubscribeFromInput: () => void

  constructor(boardSize: number, inpBind: HTMLElement) {
    const unsub = subscribeToInput(inpBind, this.onDirectionChange.bind(this))
    this.unsubscribeFromInput = unsub

    this.boardSize = boardSize
    const middle = ~~(boardSize / 2)
    this.body = [ [middle, middle] ]
    this.setFood()
  }

  private onDirectionChange(direction: Direction) {
    if(this.body.length > 1 && direction === Opposite[this.lastDirection]) {
      return
    }
    this.direction = direction
  }

  private bodyContains([row, column]: Position) {
    return this.body.some(([r, c]) => {
      return r === row && c === column
    })
  }

  private setFood() {
    const possible: Position[] = []

    for(let row = 0; row < this.boardSize; row++) {
      for(let column = 0; column < this.boardSize; column++) {
        if(!this.bodyContains([row, column])) {
          possible.push([row, column])
        }
      }
    }

    const position = choose(possible)
    this.food = position
  }

  private motion(): [number, number] {
    switch(this.direction) {
      case Direction.Up:    return [0, -1]
      case Direction.Right: return [1, 0]
      case Direction.Down:  return [0, 1]
      case Direction.Left:  return [-1, 0]
    }
  }

  private nextPosition() {
    const [ar, ac] = this.motion()
    const [r, c] = this.body[this.body.length - 1]
    return [ar + r, ac + c] as Position
  }

  private validate([row, column]: Position) {
    return row >= 0 && 
      row < this.boardSize &&
      column >= 0 &&
      column < this.boardSize
  }

  public update() {
    const next = this.nextPosition()
    if(!this.validate(next)) return false

    if(this.food[0] === next[0] && this.food[1] === next[1]) {
      this.body.push(next)
      this.setFood()
      RecordManager.instance.score()
    } else {
      this.body.shift()
      if(this.bodyContains(next)) return false
      this.body.push(next)
    }
    this.lastDirection = this.direction

    return true
  }

  public cleanup(): void {
    RecordManager.instance.reload()
    this.unsubscribeFromInput()
  }

}