function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

const prefixes: readonly string[] = [
  "Strong", "Magic", "Mean", 
  "Deadly", "Horrific", "Fast",
  "Beautiful", "Logic", "Cocky",
]

function randomPrefix(): string {
  const index = Math.floor(Math.random() * prefixes.length)
  const item = prefixes[index]
  return item
}

export function getRandomName(): string {
  const prefix = randomPrefix()
  const postfix = randomInt(100, 1000)
  const name = `${prefix}Player${postfix}`
  return name
}

export function resolveSocket(socket: WebSocket): Promise<WebSocket> {
  return new Promise((resolve, reject) => {

    const onerror = () => {
      socket.close()
      reject('WebSocket error')
    }

    const onopen = () => {
      socket.removeEventListener('error', onerror)
      socket.removeEventListener('open', onopen)
      resolve(socket)
    }

    socket.addEventListener('error', onerror)
    socket.addEventListener('open', onopen)

  })
}