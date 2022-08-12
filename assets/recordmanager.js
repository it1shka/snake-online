export default class RecordManager {
    constructor() {
        this._scoreElement = null;
        this._recordElement = null;
        this._currentScore = 0;
        const maybeRecord = localStorage.getItem(RecordManager._storageKey);
        const record = maybeRecord ? Number(maybeRecord) : 0;
        this._record = record;
    }
    static get instance() {
        if (!RecordManager._instance) {
            RecordManager._instance = new RecordManager();
        }
        return RecordManager._instance;
    }
    bindScore(element) {
        this._scoreElement = element;
    }
    bindRecord(element) {
        this._recordElement = element;
    }
    score() {
        this._currentScore++;
        if (this._currentScore > this._record) {
            this._record = this._currentScore;
            localStorage.setItem(RecordManager._storageKey, String(this._record));
        }
        this.display();
    }
    reload() {
        this._currentScore = 0;
        this.display();
    }
    display() {
        if (this._scoreElement)
            this._scoreElement.innerText = `Score: ${this._currentScore}`;
        if (this._recordElement)
            this._recordElement.innerText = `Best: ${this._record}`;
    }
}
RecordManager._storageKey = 'snake-record';
