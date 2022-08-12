import { Opposite, subscribeToInput } from "./input.js";
import { queryElement } from "./onlineinterface.js";
import { divide } from "./utils.js";
import Vizualizer from "./visualizer.js";
function SelfSnake({ body }) {
    return {
        body,
        headColor: 'orange',
        tailColor: 'red'
    };
}
function EnemySnake({ body }) {
    return {
        body,
        headColor: 'lightblue',
        tailColor: 'darkblue',
    };
}
function InvisibleSnake({ body }) {
    return {
        body,
        headColor: '#eb347a',
        tailColor: '#eb347a'
    };
}
class OnlineSnakeManager {
    constructor(socket, visualizer, inpBind) {
        this.socket = socket;
        this.visualizer = visualizer;
        this.receiveUpdate = this.receiveUpdate.bind(this);
        socket.onmessage = this.receiveUpdate;
        this.responceToInput = this.responceToInput.bind(this);
        this.unsubFromInput = subscribeToInput(inpBind, this.responceToInput);
        this.usertable = document.getElementById('usertable');
    }
    receiveUpdate(event) {
        const state = JSON.parse(event.data);
        this.state = state;
        this.drawUsertable();
        this.selfPlayer = state.snakes.find(({ self }) => self);
        this.visualizer.drawGrid();
        const [oldSnakes, newSnakes] = divide(state.snakes, ({ invisible }) => invisible);
        for (const snake of oldSnakes) {
            let drawable;
            if (snake.self)
                drawable = SelfSnake(snake);
            else
                drawable = EnemySnake(snake);
            this.visualizer.drawSnake(drawable);
        }
        for (const snake of newSnakes) {
            this.visualizer.drawSnake(InvisibleSnake(snake));
        }
        this.visualizer.drawFood(state.food);
    }
    drawUsertable() {
        const list = this.usertable.querySelector('ol');
        while (list.lastChild) {
            list.removeChild(list.lastChild);
        }
        const snakes = this.state.snakes.sort((s1, s2) => {
            return s2.body.length - s1.body.length;
        });
        for (const { name, body, self } of snakes) {
            const li = document.createElement('li');
            const you = self ? '<span class="you"> (YOU)</span>' : '';
            li.innerHTML = `${name}${you}: <span>${body.length}</span>`;
            if (self)
                li.className = 'self';
            list.appendChild(li);
        }
    }
    responceToInput(direction) {
        var _a, _b, _c, _d;
        if (((_b = (_a = this.selfPlayer) === null || _a === void 0 ? void 0 : _a.body.length) !== null && _b !== void 0 ? _b : 0) > 1 && (((_c = this.selfPlayer) === null || _c === void 0 ? void 0 : _c.direction) === direction ||
            ((_d = this.selfPlayer) === null || _d === void 0 ? void 0 : _d.direction) === Opposite[direction]))
            return;
        const data = new Uint8Array([direction]);
        this.socket.send(data);
    }
    cleanup() {
        this.socket.close();
        this.unsubFromInput();
        this.visualizer.drawGrid();
    }
}
export default function playOnline(socket) {
    // initializing vizualizer
    const canvas = document.querySelector('canvas');
    const BOARD_SIZE = 20;
    const vizualizer = new Vizualizer(canvas, BOARD_SIZE);
    // instancing main class
    const manager = new OnlineSnakeManager(socket, vizualizer, document.body);
    const usertable = document.getElementById('usertable');
    const keydownListener = (event) => {
        if (event.key !== 'Tab')
            return;
        event.preventDefault();
        usertable.style.display = 'grid';
    };
    document.body.addEventListener('keydown', keydownListener);
    const keyupListener = (event) => {
        if (event.key !== 'Tab')
            return;
        event.preventDefault();
        usertable.style.display = 'none';
    };
    document.body.addEventListener('keyup', keyupListener);
    // ability to quit room
    const quitButton = queryElement('#quit-online');
    const quitHandler = () => {
        manager.cleanup();
        document.body.removeEventListener('keydown', keydownListener);
        document.body.removeEventListener('keyup', keyupListener);
        quitButton.removeEventListener('click', quitHandler);
    };
    quitButton.addEventListener('click', quitHandler);
}
