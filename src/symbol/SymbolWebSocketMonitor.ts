import WebSocket from 'isomorphic-ws';
import { SymbolChannel, SymbolWebSocketOptions } from './symbol.types';
import { symbolChannelPaths } from './symbolChannelPaths';

// WebSocket readyState 定数のフォールバック（テスト環境ではモックに定数がないことがあるため）
const WS_OPEN = WebSocket.OPEN ?? 1;
const WS_CONNECTING = WebSocket.CONNECTING ?? 0;

/**
 * Symbolウェブソケットモニタークラス / Symbol WebSocket Monitor Class
 */
export class SymbolWebSocketMonitor {
  private _client: WebSocket;
  private _uid: string | null = null;
  private isFirstMessage = true;
  private eventCallbacks: { [event: string]: ((message: WebSocket.MessageEvent) => void)[] } = {};
  private pendingSubscribes: { subscribePath: string; callback: (message: WebSocket.MessageEvent) => void }[] = [];
  private errorCallbacks: ((err: WebSocket.ErrorEvent) => void)[] = [];
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

    // クライアントを作成 / Create client
    this._client = new WebSocket(`${protocol}://${endPointHost}:${endPointPort}/ws`, { timeout: timeout });
    // 再接続はモジュール使用者に委ねるため、内部での再接続ロジックは実装しない
    // Reconnection is left to the module user, so no internal reconnection logic is implemented.

    // クライアント接続時の処理 / On client connect
    this._client.onclose = (event: WebSocket.CloseEvent) => {
      this.onCloseCallback(event);
    };

    // エラー発生時の処理 / On error occurred
    this._client.onerror = (err: WebSocket.ErrorEvent) => {
      this.errorCallbacks.forEach((cb) => cb(err));
    };

    // メッセージ受信時の処理 / On message received
    this._client.onmessage = (message: WebSocket.MessageEvent) => {
      try {
        const data = JSON.parse(message.data.toString());
        if (this.isFirstMessage) {
          if (data.uid) {
            this._uid = data.uid;
            // pending subscribeをすべて送信 / Send all pending subscribes
            this.pendingSubscribes.forEach(({ subscribePath }) => {
              this._client.send(JSON.stringify({ uid: this._uid, subscribe: subscribePath }));
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
        if (this.errorCallbacks.length > 0) {
          const errorEvent = { ...(e instanceof Error ? e : { message: String(e) }) } as WebSocket.ErrorEvent;
          this.errorCallbacks.forEach((cb) => cb(errorEvent));
        } else {
          throw e;
        }
      }
    };
  }

  /**
   * UID
   */
  public get uid(): string | null {
    return this._uid;
  }

  /**
   * クライアントインスタンスを取得 / Get client instance
   */
  public get client(): WebSocket {
    return this._client;
  }

  /**
   * 接続状態を取得 / Get connection status
   */
  public get isConnected(): boolean {
    return this._client.readyState === WS_OPEN;
  }

  /**
   * WebSocketエラーイベント登録 / Register WebSocket error event
   * @param callback エラー時に呼ばれるコールバック / Callback called on error
   */
  public onError(callback: (err: WebSocket.ErrorEvent) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * WebSocketクローズイベント登録 / Register WebSocket close event
   * @param callback クローズ時に呼ばれるコールバック / Callback called on close
   */
  public onClose(callback: (event: WebSocket.CloseEvent) => void): void {
    this.onCloseCallback = callback;
  }

  /**
   * チャネルサブスクメソッド / Channel Subscription Method
   * @param channel チャネル名 / Channel name
   * @param callback コールバック関数 / Callback function
   * @param params パラメータ / Parameters
   */
  on(channel: SymbolChannel, callback: (message: WebSocket.MessageEvent) => void, params?: { address?: string }): void {
    const channelPath = symbolChannelPaths[channel];

    // サブスクライブパスを決定 / Determine subscribe path
    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe(params?.address) : channelPath.subscribe;
    if (!subscribePath) {
      throw new Error(`Subscribe path could not be determined for channel: ${channel}`);
    }

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

    // サブスクライブを実行 / Execute subscription
    if (this._client.readyState === WS_OPEN) {
      this._client.send(JSON.stringify({ uid: this._uid, subscribe: subscribePath }));
    }
  }

  /**
   * チャネルアンサブスクメソッド / Channel Unsubscription Method
   * @param channel チャネル名 / Channel name
   * @param params パラメータ / Parameters
   */
  off(channel: SymbolChannel, params?: { address?: string }): void {
    const channelPath = symbolChannelPaths[channel];

    // サブスクライブパスを決定 / Determine subscribe path
    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe(params?.address) : channelPath.subscribe;
    if (!subscribePath) {
      throw new Error(`Subscribe path could not be determined for channel: ${channel}`);
    }

    // コールバックをクリーンアップ / Cleanup callbacks
    delete this.eventCallbacks[subscribePath];

    // アンサブスクライブを実行 / Execute unsubscription
    if (this._uid && this._client.readyState === WS_OPEN) {
      this._client.send(JSON.stringify({ uid: this._uid, unsubscribe: subscribePath }));
    }
  }

  /**
   * WebSocket接続を切断 / Disconnect WebSocket
   */
  disconnect(): void {
    // すべてのコールバックをクリーンアップ / Cleanup all callbacks
    this.eventCallbacks = {};
    this.pendingSubscribes = [];
    this.errorCallbacks = [];

    // WebSocketを閉じる / Close WebSocket
    if (this._client.readyState === WS_OPEN || this._client.readyState === WS_CONNECTING) {
      this._client.close();
    }

    this._uid = null;
    this.isFirstMessage = true;
  }
}
