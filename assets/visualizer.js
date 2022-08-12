import { pairs } from "./utils.js";
class Vizualizer {
    constructor(canvas, boardSize) {
        this.offset = 7;
        this.ctx = canvas.getContext('2d');
        this.boardSize = boardSize;
        this.cellSize = canvas.height / boardSize;
    }
    drawGrid() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#f1f1f1';
        for (let row = 0; row < this.boardSize; row++) {
            for (let column = 0; column < this.boardSize; column++) {
                const [x, y] = [this.cellSize * row, this.cellSize * column];
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
    drawFood([row, column]) {
        const [x, y] = [this.cellSize * row + this.offset, this.cellSize * column + this.offset];
        const size = this.cellSize - 2 * this.offset;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(x, y, size, size);
    }
    drawSnake(snake) {
        // drawing body
        this.ctx.fillStyle = snake.tailColor;
        for (const [[rowS, colS], [rowE, colE]] of pairs(snake.body)) {
            const xs1 = this.cellSize * rowS + this.offset;
            const xs2 = this.cellSize * (rowS + 1) - this.offset;
            const xe1 = this.cellSize * rowE + this.offset;
            const xe2 = this.cellSize * (rowE + 1) - this.offset;
            const ys1 = this.cellSize * colS + this.offset;
            const ys2 = this.cellSize * (colS + 1) - this.offset;
            const ye1 = this.cellSize * colE + this.offset;
            const ye2 = this.cellSize * (colE + 1) - this.offset;
            const xs = Math.min(xs1, xs2, xe1, xe2);
            const ys = Math.min(ys1, ys2, ye1, ye2);
            const xe = Math.max(xs1, xs2, xe1, xe2);
            const ye = Math.max(ys1, ys2, ye1, ye2);
            this.ctx.fillRect(xs, ys, xe - xs, ye - ys);
        }
        // drawing head
        const [headRow, headCol] = snake.body[snake.body.length - 1];
        const x = headRow * this.cellSize + this.offset;
        const y = headCol * this.cellSize + this.offset;
        const size = this.cellSize - 2 * this.offset;
        this.ctx.fillStyle = snake.headColor;
        this.ctx.fillRect(x, y, size, size);
    }
}
export default Vizualizer;
