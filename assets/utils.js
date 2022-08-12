function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
const prefixes = [
    "Strong", "Magic", "Mean",
    "Deadly", "Horrific", "Fast",
    "Beautiful", "Logic", "Cocky",
];
function randomPrefix() {
    const index = Math.floor(Math.random() * prefixes.length);
    const item = prefixes[index];
    return item;
}
export function getRandomName() {
    const prefix = randomPrefix();
    const postfix = randomInt(100, 1000);
    const name = `${prefix}Player${postfix}`;
    return name;
}
export function resolveSocket(socket) {
    return new Promise((resolve, reject) => {
        const onerror = () => {
            socket.close();
            reject('WebSocket error');
        };
        const onopen = () => {
            socket.removeEventListener('error', onerror);
            socket.removeEventListener('open', onopen);
            resolve(socket);
        };
        socket.addEventListener('error', onerror);
        socket.addEventListener('open', onopen);
    });
}
export function pairs(arr) {
    const output = new Array(arr.length - 1);
    for (let i = 0; i < arr.length - 1; i++) {
        output[i] = [arr[i], arr[i + 1]];
    }
    return output;
}
export function choose(arr) {
    const index = Math.floor(Math.random() * arr.length);
    const item = arr[index];
    return item;
}
export function divide(arr, div) {
    const output = [[], []];
    for (const each of arr) {
        const k = Number(div(each));
        output[k].push(each);
    }
    return output;
}
