import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SymbolWebSocketMonitor } from '../src/symbol/SymbolWebSocketMonitor';
import type { SymbolWebSocketOptions } from '../src/symbol/symbol.types';

// WebSocketのモック
const sendMock = vi.fn();
const oncloseMock = vi.fn();
const onerrorMock = vi.fn();
const onmessageMock = vi.fn();

vi.mock('isomorphic-ws', () => {
  return {
    default: function WebSocketMock() {
      return {
        send: sendMock,
        onclose: oncloseMock,
        onerror: onerrorMock,
        onmessage: onmessageMock,
        close: vi.fn(),
      };
    },
  };
});

const defaultOptions: SymbolWebSocketOptions = {
  host: 'localhost',
  timeout: 1000,
  ssl: false,
};

describe('SymbolWebSocketMonitor', () => {
  let monitor: SymbolWebSocketMonitor;

  beforeEach(() => {
    sendMock.mockClear();
    // @ts-ignore
    monitor = new SymbolWebSocketMonitor(defaultOptions);
  });

  it('エラーなくインスタンス化されるべきである / should instantiate without error', () => {
    expect(monitor).toBeInstanceOf(SymbolWebSocketMonitor);
  });

  it('エラーコールバックが登録され、エラー時に呼び出されるべきである / should register error callback and call it', () => {
    const cb = vi.fn();
    monitor.onError(cb);
    // @ts-ignore
    monitor.errorCallbacks[0]({ type: 'error' });
    expect(cb).toHaveBeenCalled();
  });

  it('クローズコールバックが登録され、クローズ時に呼び出されるべきである / should register close callback and call it', () => {
    const cb = vi.fn();
    monitor.onClose(cb);
    // @ts-ignore
    monitor.onCloseCallback({ type: 'close' });
    expect(cb).toHaveBeenCalled();
  });

  it('uidが設定されていない場合、pendingSubscribesにプッシュされるべきである / should push to pendingSubscribes if uid is not set', () => {
    // @ts-ignore
    monitor._uid = null;
    // @ts-ignore
    monitor.on('block', vi.fn());
    // @ts-ignore
    expect(monitor.pendingSubscribes.length).toBe(1);
  });

  it('uidが設定されている場合、sendが呼び出されるべきである / should call send when uid is set', () => {
    // @ts-ignore
    monitor._uid = 'test-uid';
    // @ts-ignore
    monitor.client.readyState = 1; // simulate OPEN
    // @ts-ignore
    monitor.on('block', vi.fn());
    expect(sendMock).toHaveBeenCalled();
  });

  it('unsubscribe時にsendが呼び出されるべきである / should call send for unsubscribe', () => {
    // @ts-ignore
    monitor._uid = 'test-uid';
    // @ts-ignore
    monitor.client.readyState = 1; // simulate OPEN
    // @ts-ignore
    monitor.off('block');
    expect(sendMock).toHaveBeenCalled();
  });

  it('JSONパースエラー時にエラーコールバックが呼び出されるべきである / should call error callback on JSON parse error', () => {
    const cb = vi.fn();
    monitor.onError(cb);
    // @ts-ignore
    monitor.client.onmessage({ data: '{invalid json' });
    expect(cb).toHaveBeenCalled();
  });

  it('エラーコールバックが登録されていない場合、JSONパースエラー時に例外がスローされるべきである / should throw on JSON parse error if no error callback', () => {
    // @ts-ignore
    expect(() => monitor.client.onmessage({ data: '{invalid json' })).toThrow();
  });

  it('最初のメッセージを処理し、uidを設定し、pendingSubscribesをフラッシュするべきである / should handle first message and set uid, flush pendingSubscribes', () => {
    // @ts-ignore
    monitor.isFirstMessage = true;
    // @ts-ignore
    monitor.pendingSubscribes = [
      { subscribePath: 'block', callback: vi.fn() },
      { subscribePath: 'confirmedAdded', callback: vi.fn() },
    ];
    // @ts-ignore
    monitor.client.onmessage({ data: JSON.stringify({ uid: 'abc123' }) });
    // @ts-ignore
    expect(monitor._uid).toBe('abc123');
    // @ts-ignore
    expect(monitor.pendingSubscribes.length).toBe(0);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('特定のトピックに対してすべてのコールバックが呼び出されるべきである / should call all callbacks for a topic', () => {
    // @ts-ignore
    monitor.isFirstMessage = false;
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    // @ts-ignore
    monitor.eventCallbacks['block'] = [cb1, cb2];
    // @ts-ignore
    monitor.client.onmessage({ data: JSON.stringify({ topic: 'block', foo: 'bar' }) });
    expect(cb1).toHaveBeenCalledWith(expect.objectContaining({ topic: 'block', foo: 'bar' }));
    expect(cb2).toHaveBeenCalledWith(expect.objectContaining({ topic: 'block', foo: 'bar' }));
  });

  it('登録されていないトピックの場合、コールバックが呼び出されないべきである / should not call callback if topic is not registered', () => {
    // @ts-ignore
    monitor.isFirstMessage = false;
    const cb = vi.fn();
    // @ts-ignore
    monitor.eventCallbacks['block'] = [cb];
    // @ts-ignore
    monitor.client.onmessage({ data: JSON.stringify({ topic: 'other', foo: 'bar' }) });
    expect(cb).not.toHaveBeenCalled();
  });

  it('同じsubscribePathに対して複数のコールバックが許可されるべきである / should allow multiple callbacks for the same subscribePath', () => {
    // @ts-ignore
    monitor._uid = 'test-uid';
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    // @ts-ignore
    monitor.on('block', cb1);
    // @ts-ignore
    monitor.on('block', cb2);
    // @ts-ignore
    expect(monitor.eventCallbacks['block'].length).toBe(2);
  });

  it('uidが設定されていない場合、off呼び出し時に例外がスローされないべきである / should not throw when off is called without uid', () => {
    // @ts-ignore
    monitor._uid = null;
    // @ts-ignore
    expect(() => monitor.off('block')).not.toThrow();
  });

  describe('SymbolWebSocketMonitor extra branches', () => {
    let monitor: SymbolWebSocketMonitor;
    let clientMock: any;

    beforeEach(() => {
      // @ts-ignore
      monitor = new SymbolWebSocketMonitor(defaultOptions);
      // @ts-ignore
      clientMock = monitor.client;
      // reset mocks if present
      if (clientMock.send && (clientMock.send as any).mockClear) (clientMock.send as any).mockClear();
      if (clientMock.close && (clientMock.close as any).mockClear) (clientMock.close as any).mockClear();
      // Ensure the mocked WebSocket class provides OPEN/CONNECTING constants
      // so that comparisons in the module under test behave as expected.

      const wsMod = require('isomorphic-ws');
      if (wsMod && wsMod.default) {
        // @ts-ignore
        wsMod.default.OPEN = 1;
        // @ts-ignore
        wsMod.default.CONNECTING = 0;
      }
    });

    it('SSL=true でインスタンス化できます / can be instantiated with ssl=true', () => {
      const options: SymbolWebSocketOptions = { host: 'example', timeout: 2000, ssl: true };
      expect(() => new SymbolWebSocketMonitor(options)).not.toThrow();
    });

    it('on sends when uid present and socket OPEN', () => {
      // @ts-ignore
      monitor._uid = 'uid-1';
      // @ts-ignore
      monitor.client.readyState = 1; // WebSocket.OPEN
      // @ts-ignore
      monitor.on('block', vi.fn());
      // @ts-ignore
      expect(monitor.client.send).toHaveBeenCalled();
    });

    it('uidが存在しソケットがOPEN状態の場合、登録解除を送信する / off sends unsubscribe when uid present and socket OPEN', () => {
      // @ts-ignore
      monitor._uid = 'uid-2';
      // @ts-ignore
      monitor.client.readyState = 1; // WebSocket.OPEN
      // @ts-ignore
      monitor.off('block');
      // @ts-ignore
      expect(monitor.client.send).toHaveBeenCalled();
    });

    it('disconnect は OPEN 時にソケットを閉じる / disconnect closes socket when OPEN', () => {
      // @ts-ignore
      monitor._uid = 'uid-3';
      // @ts-ignore
      monitor.isFirstMessage = false;
      // @ts-ignore
      monitor.client.readyState = 1; // OPEN
      // ensure close exists
      // @ts-ignore
      monitor.client.close = vi.fn();

      monitor.disconnect();

      // @ts-ignore
      expect(monitor.client.close).toHaveBeenCalled();
      // @ts-ignore
      expect(monitor.uid).toBeNull();
      // @ts-ignore
      expect(monitor.isFirstMessage).toBe(true);
    });
  });
});
