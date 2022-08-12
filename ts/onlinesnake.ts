import { Direction, Opposite, subscribeToInput } from "./input.js";
import { queryElement } from "./onlineinterface.js";
import { divide } from "./utils.js";
import Vizualizer, { Position, Snake } from "./visualizer.js";

interface Player {
  name: string
  self: boolean
  direction: Direction
  body: Position[]
  invisible: boolean
}

interface GameState {
  food: Position
  snakes: Player[]
}

function SelfSnake({body}: Player): Snake {
  return {
    body, 
    headColor: 'orange',
    tailColor: 'red'
  }
}

function EnemySnake({body}: Player): Snake {
  return {
    body,
    headColor: 'lightblue',
    tailColor: 'darkblue',
  }
}

function InvisibleSnake({body}: Player): Snake {
  return {
    body, 
    headColor: '#eb347a',
    tailColor: '#eb347a'
  }
}

class OnlineSnakeManager {

  private unsubFromInput: () => void
  private selfPlayer: Player | undefined

  constructor(
    private readonly socket: WebSocket,
    private readonly visualizer: Vizualizer,
    inpBind: HTMLElement
  ) {
    this.receiveUpdate = this.receiveUpdate.bind(this)
    socket.onmessage = this.receiveUpdate
    this.responceToInput = this.responceToInput.bind(this)
    this.unsubFromInput = subscribeToInput(inpBind, this.responceToInput)
  }

  private receiveUpdate(event: MessageEvent<any>) {
    const state = JSON.parse(event.data) as GameState

    this.selfPlayer = state.snakes.find(({self}) => self)

    this.visualizer.drawGrid()

    const [oldSnakes, newSnakes] = divide(state.snakes, ({invisible}) => invisible)

    for(const snake of oldSnakes) {
      let drawable: Snake
      if(snake.self) drawable = SelfSnake(snake)
      else drawable = EnemySnake(snake)
      this.visualizer.drawSnake(drawable)
    }

    for(const snake of newSnakes) {
      this.visualizer.drawSnake(InvisibleSnake(snake))
    }

    this.visualizer.drawFood(state.food)
  }

  private responceToInput(direction: Direction) {
    if((this.selfPlayer?.body.length ?? 0) > 1 && (
      this.selfPlayer?.direction === direction ||
      this.selfPlayer?.direction === Opposite[direction]
    )) return
    const data = new Uint8Array([ direction ])
    this.socket.send(data)
  }

  public cleanup() {
    this.socket.close()
    this.unsubFromInput()
  }
}

export default function playOnline(socket: WebSocket) {

  // initializing vizualizer
  const canvas = document.querySelector('canvas')!
  const BOARD_SIZE = 20
  const vizualizer = new Vizualizer(canvas, BOARD_SIZE)

  // instancing main class
  const manager = new OnlineSnakeManager(socket, vizualizer, document.body)

  // ability to quit room
  const quitButton = queryElement<HTMLButtonElement>('#quit-online')
  const quitHandler = () => {
    manager.cleanup()
    quitButton.removeEventListener('click', quitHandler)
  }
  quitButton.addEventListener('click', quitHandler)

}

