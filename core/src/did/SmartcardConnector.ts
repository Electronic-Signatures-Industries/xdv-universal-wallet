import { CompatClient, Stomp } from '@stomp/stompjs'
import { Subject } from 'rxjs'
Object.assign(global, { WebSocket: require('websocket').w3cwebsocket })

export interface SignResponse {
  publicKey: string
  publicKey2?: string
  certificate?: string
  signature: string
  digest: string
  type: string
  error: string
}
export interface SmartCardConnectorEvent {
  eventName: string
  payload: any
}
const CLIENT_API = 'ws://localhost:8089'
export class SmartCardConnectorPKCS11 {
  module: string
  subscribe: Subject<any> = new Subject()
  socket: any
  stompClient: CompatClient
  constructor(private keyId?: string) {
    this.keyId = keyId
  }

  /**
   * Request current HSM / Smartcards slots
   * @returns void
   */
  async getSlots(): Promise<void> {
    // const slots = await axios(`${CLIENT_API}/sc/get_slots`);
    if (!this.stompClient.connected) {
      return
    }
    this.stompClient.publish({
      destination: '/app/get_slots',
      skipContentLengthHeader: true,
    })
  }

  /**
   * 
   * @param index Slot index
   * @param pin PIN
   * @param data Data as Uint8Array
   * @returns A Promise<SignResponse>
   */
  async signPromise(
    index: string,
    pin: string,
    data: Uint8Array,
  ): Promise<SignResponse> {
    return new Promise((resolve, reject) => {
      const c = this.stompClient.subscribe('/xdv/signed', (res: any) => {
        resolve(JSON.parse(res.body) as SignResponse)
        c.unsubscribe()
      })

      this.stompClient.publish({
        destination: '/app/sign',
        body: JSON.stringify({
          tokenIndex: index,
          pin: pin,
          data,
        }),
      })
    })
  }

  /**
   * Get certificates
   * @param index Slot index
   * @param pin PIN
   * @returns A Promise<SignResponse>
   */
  async getCerts(index: string, pin: string): Promise<SignResponse> {
    return new Promise((resolve, reject) => {
      const c = this.stompClient.subscribe('/xdv/certificates', (data: any) => {
        resolve(JSON.parse(data.body) as SignResponse)
        c.unsubscribe()
      })

      this.stompClient.publish({
        destination: '/app/get_certificates',
        body: JSON.stringify({
          tokenIndex: index,
          pin: pin,
        }),
      })
    })
  }

  async sign(index: string, pin: string, data: Buffer) {
    this.stompClient.publish({
      destination: '/app/sign',
      body: JSON.stringify({
        tokenIndex: index,
        pin: pin,
        data: data.toString('base64'),
      }),
    })
  }

  /**
   * Connects to Java Signer
   * @returns A Promise
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.stompClient = Stomp.client(CLIENT_API + '/ws')

        this.stompClient.onConnect = (frame) => {
          resolve(true)
          this.stompClient.subscribe('/xdv/messages', (data) => {
            this.subscribe.next(JSON.parse(data.body))
          })
        }
        if (this.stompClient.connected === false) {
          this.stompClient.activate()
        }
      } catch (e) {
        reject(e)
        console.log('no client found')
      }
    })
  }
}
