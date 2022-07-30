export default class ApiInterface {

  constructor(
    private readonly baseUrl: string
  ) {}


  public async createRoom(maxPlayers: number): Promise<string> {
    const url = new URL('/api/room/create', this.baseUrl)
    url.searchParams.append("maxplayers", String(maxPlayers))
    const href = url.href

    console.log(`Creating room: ${href}`)

    const result = await fetch(href)
    const data = await result.text()
    
    return data
  }
}