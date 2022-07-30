import ApiInterface from "./api.js"
import { getRandomName } from "./utils.js"

// API Manager instance in the top
const API = new ApiInterface('http://localhost:3000')

// WORKING WITH FORMS TO CONNECT ROOM

function findById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  return element as T
}

// name input
const nameInput = findById<HTMLInputElement>('player-name-input')

function assignNameIfEmpty(): void {
  if(!nameInput.value) {
    nameInput.value = getRandomName()
  }
}

assignNameIfEmpty()

nameInput.addEventListener('focusout', () => {
  nameInput.value = nameInput.value.trim()
  if(nameInput.value.length > 18) {
    nameInput.value = nameInput.value.slice(0, 18)
  }
  assignNameIfEmpty()
})

// connect to room form
const connectRoomForm = findById<HTMLFormElement>('connect-room-form')

function connectRoomHandler(this: HTMLFormElement, event: SubmitEvent): void {
  event.preventDefault()
  // DO SOMETHING HERE !!!
}

connectRoomForm.addEventListener('submit', connectRoomHandler)

// create room form
const createRoomForm = findById<HTMLFormElement>('create-room-form')

function createRoomHandler(this: HTMLFormElement, event: SubmitEvent): void {
  event.preventDefault()
  const maxPlayers = Number(this.querySelector('input')!.value)
  API.createRoom(maxPlayers).then(roomId => {
    alert(roomId)
  })
}

createRoomForm.addEventListener('submit', createRoomHandler)