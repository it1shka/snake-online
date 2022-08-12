import { Opposite, subscribeToInput } from "./input.js";
import RecordManager from "./recordmanager.js";
import { choose } from "./utils.js";
export default class OfflineSnake {
    constructor(boardSize, inpBind) {
        this.headColor = 'red';
        this.tailColor = 'orange';
        this.direction = 0 /* Up */;
        this.lastDirection = 0 /* Up */;
        const unsub = subscribeToInput(inpBind, this.onDirectionChange.bind(this));
        this.unsubscribeFromInput = unsub;
        this.boardSize = boardSize;
        const middle = ~~(boardSize / 2);
        this.body = [[middle, middle]];
        this.setFood();
    }
    onDirectionChange(direction) {
        if (this.body.length > 1 && direction === Opposite[this.lastDirection]) {
            return;
        }
        this.direction = direction;
    }
    bodyContains([row, column]) {
        return this.body.some(([r, c]) => {
            return r === row && c === column;
        });
    }
    setFood() {
        const possible = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let column = 0; column < this.boardSize; column++) {
                if (!this.bodyContains([row, column])) {
                    possible.push([row, column]);
                }
            }
        }
        const position = choose(possible);
        this.food = position;
    }
    motion() {
        switch (this.direction) {
            case 0 /* Up */: return [0, -1];
            case 1 /* Right */: return [1, 0];
            case 2 /* Down */: return [0, 1];
            case 3 /* Left */: return [-1, 0];
        }
    }
    nextPosition() {
        const [ar, ac] = this.motion();
        const [r, c] = this.body[this.body.length - 1];
        return [ar + r, ac + c];
    }
    validate([row, column]) {
        return row >= 0 &&
            row < this.boardSize &&
            column >= 0 &&
            column < this.boardSize;
    }
    update() {
        const next = this.nextPosition();
        if (!this.validate(next))
            return false;
        if (this.food[0] === next[0] && this.food[1] === next[1]) {
            this.body.push(next);
            this.setFood();
            RecordManager.instance.score();
        }
        else {
            this.body.shift();
            if (this.bodyContains(next))
                return false;
            this.body.push(next);
        }
        this.lastDirection = this.direction;
        return true;
    }
    cleanup() {
        RecordManager.instance.reload();
        this.unsubscribeFromInput();
    }
}
