import OfflineSnake from "./offlinesnake.js"
import RecordManager from "./recordmanager.js"
import Vizualizer from "./visualizer.js"

const scoreElement = document.getElementById('score')!
const recordElement = document.getElementById('record')!
RecordManager.instance.bindScore(scoreElement)
RecordManager.instance.bindRecord(recordElement)
RecordManager.instance.reload()

const canvas = document.querySelector('canvas')!
const BOARD_SIZE = 20
const vizualizer = new Vizualizer(canvas, BOARD_SIZE)

let currentlyRunningLoop: number | undefined
let snakeInstance: OfflineSnake
let running = true

function replay(): void {
  clearInterval(currentlyRunningLoop)
  snakeInstance.cleanup()
  playGame()
}

function pause(): void {
  running = !running
}

function playGame(): void {
  snakeInstance = new OfflineSnake(BOARD_SIZE, document.body)

  currentlyRunningLoop = setInterval(() => {
    if(!running) return
    vizualizer.drawGrid()
    vizualizer.drawSnake(snakeInstance)
    vizualizer.drawFood(snakeInstance.food)

    const result = snakeInstance.update()
    if(!result) {
      replay()
    }
  }, 1000 / 5) // it means 5 fps
}

playGame()

document.body.addEventListener('keydown', evt => {
  const key = evt.key.toLowerCase()
  switch(key) {
    case 'r': return replay()
    case 'p': return pause()
  }
})