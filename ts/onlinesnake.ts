import { Direction, DirectionCode, DirectionToCodeMap, subscribeToInput } from "./input.js";
import { queryElement } from "./onlineinterface.js";
import Vizualizer, { Position } from "./visualizer.js";

interface Player {
  name: string
  self: boolean
  direction: DirectionCode
  body: Position[]
  invisible: boolean
}

interface GameState {
  food: Position
  snakes: Player[]
}

class OnlineSnakeManager {
  private state!: GameState
  private unsubFromInput: () => void

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
    this.state = state

    this.visualizer.drawGrid()

    for(const snake of state.snakes) {
      this.visualizer.drawSnake({
        body: snake.body,
        headColor: 'grey',
        tailColor: 'black',
      })
    }

    this.visualizer.drawFood(state.food)
  }

  private responceToInput(direction: Direction) {
      const dirCode = DirectionToCodeMap[direction]
      const data = new Uint8Array([ dirCode ])
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

