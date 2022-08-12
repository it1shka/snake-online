var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { resolveSocket } from "./utils.js";
class ApiInterface {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    createRoom(maxPlayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL('/api/room/create', this.baseUrl);
            url.searchParams.append('maxplayers', String(maxPlayers));
            const href = url.href;
            console.log(`Creating room: ${href}`);
            const result = yield fetch(href);
            const data = yield result.text();
            return data;
        });
    }
    connectToRoom(roomId, selfname) {
        const url = new URL(`/api/room/${roomId}/connect`, this.baseUrl.replace('http', 'ws'));
        url.searchParams.append('name', selfname);
        console.log('Connecting to room: ' + url.href);
        const connection = new WebSocket(url);
        return resolveSocket(connection);
    }
}
export default new ApiInterface('http://localhost:3000');
