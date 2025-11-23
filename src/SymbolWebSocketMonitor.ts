import WebSocket from 'isomorphic-ws';
import { SymbolChannel, SymbolWebSocketOptions } from './symbol.types';
import { symbolChannelPaths } from './symbolChannelPaths';

/**
 * Symbolウェブソケットモニタークラス / Symbol WebSocket Monitor Class
 */
export class SymbolWebSocketMonitor {
  private client: WebSocket;
  private _uid: string | null = null;
  private isFirstMessage = true;
  // eslint-disable-next-line no-unused-vars
  private eventCallbacks: { [event: string]: ((message: WebSocket.MessageEvent) => void)[] } = {};
  // eslint-disable-next-line no-unused-vars
  private pendingSubscribes: { subscribePath: string; callback: (message: WebSocket.MessageEvent) => void }[] = [];
  // eslint-disable-next-line no-unused-vars
  private errorCallbacks: ((err: WebSocket.ErrorEvent) => void)[] = [];
  // eslint-disable-next-line no-unused-vars
  private onCloseCallback: (event: WebSocket.CloseEvent) => void = () => {};

  /**
   * コンストラクタ / Constructor
   * @param options Symbolウェブソケットオプション / Symbol WebSocket Options
   */
  constructor(options: SymbolWebSocketOptions) {
    const endPointHost = options.host;
    const timeout = options.timeout ?? 5000;
    const ssl = options.ssl ?? false;

    const protocol = ssl ? 'wss' : 'ws';
    const endPointPort = ssl ? '3001' : '3000';

    console.log(`Connecting to Symbol WebSocket at ${protocol}://${endPointHost}:${endPointPort}/ws`);
    this.client = new WebSocket(`${protocol}://${endPointHost}:${endPointPort}/ws`, { timeout: timeout });

    this.client.onclose = (event: WebSocket.CloseEvent) => {
      this.onCloseCallback(event);
    };

    this.client.onerror = (err: WebSocket.ErrorEvent) => {
      this.errorCallbacks.forEach((cb) => cb(err));
    };

    this.client.onmessage = (message: WebSocket.MessageEvent) => {
      try {
        const data = JSON.parse(message.data.toString());
        if (this.isFirstMessage) {
          if (data.uid) {
            this._uid = data.uid;
            console.log('UID saved:', this._uid);
            // pending subscribeをすべて送信 / Send all pending subscribes
            this.pendingSubscribes.forEach(({ subscribePath }) => {
              this.client.send(JSON.stringify({ uid: this._uid, subscribe: subscribePath }));
            });
            this.pendingSubscribes = [];
          }
          this.isFirstMessage = false;
          return;
        }
        const channel = data.topic;
        if (channel && this.eventCallbacks[channel]) {
          this.eventCallbacks[channel].forEach((cb) => cb(data));
        }
      } catch (e) {
        console.warn('Failed to parse message:', e);
      }
    };
  }

  /**
   * UID
   */
  get uid(): string | null {
    return this._uid;
  }

  /**
   * WebSocketエラーイベント登録 / Register WebSocket error event
   * @param callback エラー時に呼ばれるコールバック / Callback called on error
   */
  // eslint-disable-next-line no-unused-vars
  public onError(callback: (err: WebSocket.ErrorEvent) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * WebSocketクローズイベント登録 / Register WebSocket close event
   * @param callback クローズ時に呼ばれるコールバック / Callback called on close
   */
  // eslint-disable-next-line no-unused-vars
  public onClose(callback: (event: WebSocket.CloseEvent) => void): void {
    this.onCloseCallback = callback;
  }

  /**
   * チャネルサブスクメソッド / Channel Subscription Method
   * @param channel チャネル名 / Channel name
   * @param callback コールバック関数 / Callback function
   * @param params パラメータ / Parameters
   */
  // eslint-disable-next-line no-unused-vars
  on(channel: SymbolChannel, callback: (message: WebSocket.MessageEvent) => void, params?: { address?: string }): void {
    const channelPath = symbolChannelPaths[channel];
    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe(params?.address) : channelPath.subscribe;
    // コールバック登録 / Register callback
    if (!this.eventCallbacks[subscribePath]) {
      this.eventCallbacks[subscribePath] = [];
    }
    this.eventCallbacks[subscribePath].push(callback);
    // サブスクライブメッセージ送信 / Send subscribe message
    if (!this._uid) {
      // uid未取得なら保留 / If UID is not obtained, hold
      this.pendingSubscribes.push({ subscribePath, callback });
      return;
    }
    this.client.send(JSON.stringify({ uid: this._uid, subscribe: subscribePath }));
  }

  /**
   * チャネルアンサブスクメソッド / Channel Unsubscription Method
   * @param channel チャネル名 / Channel name
   */
  off(channel: SymbolChannel): void {
    const channelPath = symbolChannelPaths[channel];
    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe() : channelPath.subscribe;
    this.client.send(JSON.stringify({ uid: this._uid, unsubscribe: subscribePath }));
  }
}
