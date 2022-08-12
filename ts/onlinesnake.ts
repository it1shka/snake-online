import { DirectionToCodeMap, subscribeToInput } from "./input.js";
import { queryElement } from "./onlineinterface.js";
import Vizualizer from "./visualizer.js";

export default function playOnline(socket: WebSocket) {
  // ability to quit room
  const quitButton = queryElement<HTMLButtonElement>('#quit-online')
  const quitHandler = () => {
    socket.close()
    quitButton.removeEventListener('click', quitHandler)
  }
  quitButton.addEventListener('click', quitHandler)

  // initializing vizualizer
  const canvas = document.querySelector('canvas')!
  const BOARD_SIZE = 20
  const vizualizer = new Vizualizer(canvas, BOARD_SIZE)

  // input manager
  subscribeToInput(document.body, direction => {
    const dirCode = DirectionToCodeMap[direction]
    const data = new Uint8Array([ dirCode ])
    socket.send(data)
    return true
  })

  socket.onmessage = event => {
    console.log(event.data)
  }

}