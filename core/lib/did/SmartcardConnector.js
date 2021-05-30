"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartCardConnectorPKCS11 = void 0;
const stompjs_1 = require("@stomp/stompjs");
const rxjs_1 = require("rxjs");
Object.assign(global, { WebSocket: require('websocket').w3cwebsocket });
const CLIENT_API = 'ws://localhost:8089';
class SmartCardConnectorPKCS11 {
    constructor(keyId) {
        this.keyId = keyId;
        this.subscribe = new rxjs_1.Subject();
        this.keyId = keyId;
    }
    /**
     * Request current HSM / Smartcards slots
     * @returns void
     */
    async getSlots() {
        // const slots = await axios(`${CLIENT_API}/sc/get_slots`);
        if (!this.stompClient.connected) {
            return;
        }
        this.stompClient.publish({
            destination: '/app/get_slots',
            skipContentLengthHeader: true,
        });
    }
    /**
     *
     * @param index Slot index
     * @param pin PIN
     * @param data Data as Uint8Array
     * @returns A Promise<SignResponse>
     */
    async signPromise(index, pin, data) {
        return new Promise((resolve, reject) => {
            const c = this.stompClient.subscribe('/xdv/signed', (res) => {
                resolve(JSON.parse(res.body));
                c.unsubscribe();
            });
            this.stompClient.publish({
                destination: '/app/sign',
                body: JSON.stringify({
                    tokenIndex: index,
                    pin: pin,
                    data,
                }),
            });
        });
    }
    /**
     * Get certificates
     * @param index Slot index
     * @param pin PIN
     * @returns A Promise<SignResponse>
     */
    async getCerts(index, pin) {
        return new Promise((resolve, reject) => {
            const c = this.stompClient.subscribe('/xdv/certificates', (data) => {
                resolve(JSON.parse(data.body));
                c.unsubscribe();
            });
            this.stompClient.publish({
                destination: '/app/get_certificates',
                body: JSON.stringify({
                    tokenIndex: index,
                    pin: pin,
                }),
            });
        });
    }
    async sign(index, pin, data) {
        this.stompClient.publish({
            destination: '/app/sign',
            body: JSON.stringify({
                tokenIndex: index,
                pin: pin,
                data: data.toString('base64'),
            }),
        });
    }
    /**
     * Connects to Java Signer
     * @returns A Promise
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.stompClient = stompjs_1.Stomp.client(CLIENT_API + '/ws');
                this.stompClient.onConnect = (frame) => {
                    resolve(true);
                    this.stompClient.subscribe('/xdv/messages', (data) => {
                        this.subscribe.next(JSON.parse(data.body));
                    });
                };
                if (this.stompClient.connected === false) {
                    this.stompClient.activate();
                }
            }
            catch (e) {
                reject(e);
                console.log('no client found');
            }
        });
    }
}
exports.SmartCardConnectorPKCS11 = SmartCardConnectorPKCS11;
//# sourceMappingURL=SmartcardConnector.js.map