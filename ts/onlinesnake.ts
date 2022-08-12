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
  private usertable: HTMLElement
  private state!: GameState

  constructor(
    private readonly socket: WebSocket,
    private readonly visualizer: Vizualizer,
    inpBind: HTMLElement
  ) {
    this.receiveUpdate = this.receiveUpdate.bind(this)
    socket.onmessage = this.receiveUpdate
    this.responceToInput = this.responceToInput.bind(this)
    this.unsubFromInput = subscribeToInput(inpBind, this.responceToInput)
    this.usertable = document.getElementById('usertable')!
  }

  private receiveUpdate(event: MessageEvent<any>) {
    const state = JSON.parse(event.data) as GameState
    this.state = state
    this.drawUsertable()

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

  private drawUsertable() {
    const list = this.usertable.querySelector('ol')!
    while(list.lastChild) {
      list.removeChild(list.lastChild)
    }
    const snakes = this.state.snakes.sort((s1, s2) => {
      return s2.body.length - s1.body.length
    })
    for(const {name, body, self} of snakes) {
      const li = document.createElement('li')
      const you = self ? '<span class="you"> (YOU)</span>' : ''
      li.innerHTML = `${name}${you}: <span>${body.length}</span>`
      if(self) li.className = 'self'
      list.appendChild(li)
    }
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
    this.visualizer.drawGrid()
  }
}

export default function playOnline(socket: WebSocket) {

  // initializing vizualizer
  const canvas = document.querySelector('canvas')!
  const BOARD_SIZE = 20
  const vizualizer = new Vizualizer(canvas, BOARD_SIZE)

  // instancing main class
  const manager = new OnlineSnakeManager(socket, vizualizer, document.body)

  const usertable = document.getElementById('usertable')!
  const keydownListener = (event: KeyboardEvent) => {
    if(event.key !== 'Tab') return
    event.preventDefault()
    usertable.style.display = 'grid'
  }
  document.body.addEventListener('keydown', keydownListener)
  const keyupListener = (event: KeyboardEvent) => {
    if(event.key !== 'Tab') return
    event.preventDefault()
    usertable.style.display = 'none'
  }
  document.body.addEventListener('keyup', keyupListener)

  // ability to quit room
  const quitButton = queryElement<HTMLButtonElement>('#quit-online')
  const quitHandler = () => {
    manager.cleanup()
    document.body.removeEventListener('keydown', keydownListener)
    document.body.removeEventListener('keyup', keyupListener)
    quitButton.removeEventListener('click', quitHandler)
  }
  quitButton.addEventListener('click', quitHandler)

}

