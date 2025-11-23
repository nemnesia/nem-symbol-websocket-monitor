import { Client } from '@stomp/stompjs';
import WebSocket from 'isomorphic-ws';
import { NemChannel, NemWebSocketOptions } from './nem.types';
import { nemChannelPaths } from './nemChannelPaths';

/**
 * NEMウェブソケットモニタークラス / NEM WebSocket Monitor Class
 */
export class NemWebSocketMonitor {
  private client: Client;
  private isConnected = false;
  // eslint-disable-next-line no-unused-vars
  private pendingSubscribes: { subscribePath: string; callback: (message: string) => void }[] = [];
  // eslint-disable-next-line no-unused-vars
  private errorCallbacks: ((err: WebSocket.ErrorEvent) => void)[] = [];
  // eslint-disable-next-line no-unused-vars
  private onCloseCallback: (event: WebSocket.CloseEvent) => void = () => {};
  /**
   * コンストラクタ / Constructor
   * @param options NEMウェブソケットオプション / NEM WebSocket Options
   */
  constructor(options: NemWebSocketOptions) {
    const endPointHost = options.host;
    const timeout = options.timeout ?? 5000;
    const ssl = options.ssl ?? false;

    const protocol = ssl ? 'wss' : 'ws';
    const endPointPort = ssl ? '7779' : '7778';

    this.client = new Client({
      connectionTimeout: timeout,
      reconnectDelay: timeout,
      webSocketFactory: () => new WebSocket(`${protocol}://${endPointHost}:${endPointPort}/w/messages/websocket`),
    });

    this.client.onWebSocketError = (event: WebSocket.ErrorEvent) => {
      this.errorCallbacks.forEach((cb) => cb(event));
    };

    this.client.onWebSocketClose = (event: WebSocket.CloseEvent) => {
      this.onCloseCallback(event);
    };

    this.client.onConnect = () => {
      this.isConnected = true;
      // 保留中のsubscribeをすべて実行 / Execute all pending subscribes
      this.pendingSubscribes.forEach(({ subscribePath, callback }) => {
        this.client.subscribe(subscribePath, (message) => callback(message.body));
      });
      this.pendingSubscribes = [];
    };

    this.client.activate();
  }

  /**
   * チャネルサブスクメソッド / Channel Subscription Method
   * @param channel チャネル名 / Channel name
   * @param callback コールバック関数 / Callback function
   * @param params パラメータ / Parameters
   */
  // eslint-disable-next-line no-unused-vars
  on(channel: NemChannel, callback: (message: string) => void, params?: { address?: string }): void {
    const channelPath = nemChannelPaths[channel];

    // アドレスが必要なチャネルでアドレスが提供されていない場合、エラーをスロー
    // / Throw an error if address is required for the channel but not provided
    if (typeof channelPath.subscribe === 'function' && !params?.address) {
      throw new Error(`Address parameter is required for channel: ${channel}`);
    }

    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe(params?.address) : channelPath.subscribe;

    if (!this.isConnected) {
      this.pendingSubscribes.push({ subscribePath, callback });
      return;
    }
    this.client.subscribe(subscribePath, (message) => callback(message.body));
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
   * チャネルアンサブスクメソッド / Channel Unsubscription Method
   * @param channel チャネル名 / Channel name
   */
  off(channel: NemChannel): void {
    const channelPath = nemChannelPaths[channel];
    const subscribePath = typeof channelPath.subscribe === 'function' ? channelPath.subscribe() : channelPath.subscribe;
    this.client.unsubscribe(subscribePath);
  }
}
