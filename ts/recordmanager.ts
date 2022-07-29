export default class RecordManager {
  private static _instance: RecordManager

  public static get instance(): RecordManager {
    if(!RecordManager._instance) {
      RecordManager._instance = new RecordManager()
    }
    return RecordManager._instance
  }

  private static _storageKey = 'snake-record'
  private _record: number
  private _currentScore: number

  private _scoreElement: HTMLElement | null = null
  private _recordElement: HTMLElement | null = null

  private constructor() {
    this._currentScore = 0
    const maybeRecord = localStorage.getItem(RecordManager._storageKey)
    const record = maybeRecord ? Number(maybeRecord) : 0
    this._record = record
  }

  public bindScore(element: HTMLElement): void {
    this._scoreElement = element
  }

  public bindRecord(element: HTMLElement): void {
    this._recordElement = element
  }

  public score(): void {
    this._currentScore++
    if(this._currentScore > this._record) {
      this._record = this._currentScore
      localStorage.setItem(RecordManager._storageKey, String(this._record))
    }
    this.display()
  }

  public reload(): void {
    this._currentScore = 0
    this.display()
  }

  private display(): void {
    if(this._scoreElement) 
      this._scoreElement.innerText = `Score: ${this._currentScore}`
    if(this._recordElement)
      this._recordElement.innerText = `Best: ${this._record}`
  }
}