import { getRandomName } from "./utils.js"

export function queryElement<T extends HTMLElement>(query: string): T {
  const element = document.querySelector(query)
  if(element === null) {
    throw new Error(`Tried to query element: "${query}. Not found"`)
  }
  return element as T
}

interface StartGamePanelInterfaceProps {
  onconnectroom?: (roomId: string, name: string) => void
  oncreateroom?: (maxPlayers: number) => void
}

class StartGamePanelInterface {

  private root: HTMLElement

  private playerNameInput: HTMLInputElement
  private connectInput: HTMLInputElement
  private createInput: HTMLInputElement

  private connectRoomForm: HTMLFormElement
  private createRoomForm: HTMLFormElement

  private props: StartGamePanelInterfaceProps

  constructor(props: StartGamePanelInterfaceProps) {
    this.props = props

    this.root = queryElement('.start-game-panel-wrapper')
    this.playerNameInput = queryElement('#player-name-input')
    this.connectInput = queryElement('#connect-input')
    this.createInput = queryElement('#create-input')
    this.connectRoomForm = queryElement('#connect-room-form')
    this.createRoomForm = queryElement('#create-room-form')

    this.activatePlayerNameInput()
    this.activateConnectRoomForm()
    this.activateCreateRoomForm()

    queryElement<HTMLButtonElement>('#quit-online').addEventListener('click', () => {
      this.togglePanelVisibility()
    })
  }

  private activatePlayerNameInput(): void {
    const handler = () => {
      if(!this.playerNameInput.value) {
        this.playerNameInput.value = getRandomName()
      }
    }
    handler()
    this.playerNameInput.addEventListener('focusout', handler)
  }

  private activateConnectRoomForm(): void {
    this.connectRoomForm.addEventListener('submit', event => {
      event.preventDefault()
      const name = this.playerNameInput.value
      const roomId = this.connectInput.value
      if(this.props.onconnectroom) {
        this.props.onconnectroom(roomId, name)
      }
    })
  }

  private activateCreateRoomForm(): void {
    this.createRoomForm.addEventListener('submit', event => {
      event.preventDefault()
      const maxPlayers = Number(this.createInput.value)
      if(this.props.oncreateroom) {
        this.props.oncreateroom(maxPlayers)
      }
    })
  }

  public setConnectInput(value: string): void {
    this.connectInput.value = value
  }

  public togglePanelVisibility(): void {
    this.root.classList.toggle('invisible')
  }
}

export default StartGamePanelInterface