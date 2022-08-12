import { resolveSocket } from "./utils.js"

class ApiInterface {

  constructor(
    private readonly baseUrl: string
  ) {}

  public async createRoom(maxPlayers: number): Promise<string> {
    const url = new URL('/api/room/create', this.baseUrl)
    url.searchParams.append('maxplayers', String(maxPlayers))
    const href = url.href

    console.log(`Creating room: ${href}`)

    const result = await fetch(href)
    const data = await result.text()
    
    return data
  }

  public connectToRoom(roomId: string, selfname: string): Promise<WebSocket> {
    const url = new URL(`/api/room/${roomId}/connect`, this.baseUrl.replace('http', 'ws'))
    url.searchParams.append('name', selfname)

    console.log('Connecting to room: ' + url.href)

    const connection = new WebSocket(url)
    return resolveSocket(connection)
  }
}

const apiSource = window.location.protocol + '//' + window.location.host
export default new ApiInterface(apiSource)