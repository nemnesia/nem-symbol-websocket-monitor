import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NemWebSocketMonitor } from '../src/nem/NemWebSocketMonitor';
import type { NemWebSocketOptions } from '../src/nem/nem.types';

// モック用
vi.mock('@stomp/stompjs', () => ({
  Client: function ClientMock() {
    return {
      activate: vi.fn(),
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      unsubscribe: vi.fn(),
      deactivate: vi.fn(),
      onWebSocketError: undefined,
      onWebSocketClose: undefined,
      onConnect: undefined,
    };
  },
}));
vi.mock('isomorphic-ws', () => ({
  default: function WebSocketMock() {
    return {};
  },
}));

const defaultOptions: NemWebSocketOptions = {
  host: 'localhost',
  timeout: 1000,
  ssl: false,
};

describe('NemWebSocketMonitor', () => {
  let monitor: NemWebSocketMonitor;
  let clientMock: any;

  beforeEach(() => {
    // @ts-ignore
    monitor = new NemWebSocketMonitor(defaultOptions);
    // @ts-ignore
    clientMock = monitor.client;
  });

  it('エラーなくインスタンス化されるべきである / should instantiate without error', () => {
    expect(monitor).toBeInstanceOf(NemWebSocketMonitor);
  });

  it('エラーコールバックが登録され、エラー時に呼び出されるべきである / should register error callback and call it on error', () => {
    const cb = vi.fn();
    monitor.onError(cb);
    // @ts-ignore
    monitor.errorCallbacks[0]({ type: 'error' });
    expect(cb).toHaveBeenCalled();
  });

  it('クローズコールバックが登録され、クローズ時に呼び出されるべきである / should register close callback and call it on close', () => {
    const cb = vi.fn();
    monitor.onClose(cb);
    // @ts-ignore
    monitor.onCloseCallback({ type: 'close' });
    expect(cb).toHaveBeenCalled();
  });

  it('addressが必要だが提供されていない場合、例外がスローされるべきである / should throw if address is required but not provided', () => {
    // nemChannelPathsのaccountはfunction型
    expect(() => {
      // @ts-ignore
      monitor.on('account', vi.fn());
    }).toThrow();
  });

  it('接続されていない場合、pendingSubscribesにプッシュされるべきである / should push to pendingSubscribes if not connected', () => {
    // @ts-ignore
    monitor.isConnected = false;
    // @ts-ignore
    monitor.on('blocks', vi.fn());
    // @ts-ignore
    expect(monitor.pendingSubscribes.length).toBe(1);
  });

  it('接続されている場合、subscribeが呼び出されるべきである / should call subscribe if connected', () => {
    // @ts-ignore
    monitor.isConnected = true;
    const spy = vi.spyOn(clientMock, 'subscribe');
    // @ts-ignore
    monitor.on('blocks', vi.fn());
    expect(spy).toHaveBeenCalled();
  });

  it('unsubscribeが呼び出されるべきである / should call unsubscribe on off', () => {
    const spy = vi.spyOn(clientMock, 'unsubscribe');
    // @ts-ignore
    monitor.off('blocks');
    expect(spy).toHaveBeenCalled();
  });

  it('接続時にすべてのpendingSubscribesが実行されるべきである / should execute all pendingSubscribes on connect', () => {
    // @ts-ignore
    monitor.isConnected = false;
    const cb = vi.fn();
    // @ts-ignore
    monitor.on('blocks', cb);
    // @ts-ignore
    expect(monitor.pendingSubscribes.length).toBe(1);
    // onConnectを呼ぶ
    // @ts-ignore
    monitor.client.onConnect();
    // pendingSubscribesが空になっていること
    // @ts-ignore
    expect(monitor.pendingSubscribes.length).toBe(0);
  });

  it('サブスクライブされたメッセージを受信したときにコールバックが呼び出されるべきである / should call callback when subscribed message received', () => {
    // @ts-ignore
    monitor.isConnected = true;
    const cb = vi.fn();
    // @ts-ignore
    monitor.on('blocks', cb);
    // subscribe時のコールバックを取得
    const subscribeCall = clientMock.subscribe.mock.calls[0];
    const handler = subscribeCall[1];
    handler({ body: 'test-message' });
    expect(cb).toHaveBeenCalledWith('test-message');
  });

  it('クライアントからのエラーおよびクローズイベントが伝播されるべきである / should propagate error and close events from client', () => {
    const errorCb = vi.fn();
    const closeCb = vi.fn();
    monitor.onError(errorCb);
    monitor.onClose(closeCb);
    // @ts-ignore
    monitor.client.onWebSocketError({ type: 'error' });
    // @ts-ignore
    monitor.client.onWebSocketClose({ type: 'close' });
    expect(errorCb).toHaveBeenCalled();
    expect(closeCb).toHaveBeenCalled();
  });

  describe('NemWebSocketMonitor extra behavior', () => {
    let monitor: NemWebSocketMonitor;
    let clientMock: any;

    beforeEach(() => {
      // @ts-ignore
      monitor = new NemWebSocketMonitor(defaultOptions);
      // @ts-ignore
      clientMock = monitor.client;
    });

    it('SSL=true でインスタンス化でき、例外をスローしない / can be instantiated with ssl=true without throwing', () => {
      const options: NemWebSocketOptions = { host: 'example', timeout: 1234, ssl: true };
      expect(() => new NemWebSocketMonitor(options)).not.toThrow();
    });

    it('切断すると、すべてのサブスクリプションが解除され、クライアントが無効化されます / disconnect unsubscribes all subscriptions and deactivates client', () => {
      // @ts-ignore
      monitor.isConnected = true;
      const unsubSpy = vi.fn();
      // @ts-ignore
      monitor.subscriptions.set('/test', { unsubscribe: unsubSpy });
      // ensure client has deactivate
      // @ts-ignore
      clientMock.deactivate = vi.fn();

      monitor.disconnect();

      expect(unsubSpy).toHaveBeenCalled();
      // @ts-ignore
      expect(clientMock.deactivate).toHaveBeenCalled();
      // @ts-ignore
      expect(monitor.subscriptions.size).toBe(0);
    });
  });
});
