# NEM/Symbol WebSocket Monitor

NEM Symbol WebSocket Monitor は、NEM および Symbol ブロックチェーンのリアルタイムデータを監視するための TypeScript ライブラリです。このライブラリは、WebSocket を使用してブロックチェーンデータを効率的に取得し、サブスクリプションベースのイベントリスニングを提供します。

## 特徴

- **リアルタイムデータ取得**: ブロック、トランザクション、アカウント情報などをリアルタイムで取得可能。
- **柔軟なサブスクリプション管理**: 必要なチャネルに簡単にサブスクライブおよびアンサブスクライブ可能。
- **エラーおよびクローズイベントのハンドリング**: WebSocket のエラーや接続終了を簡単に処理可能。
- **再接続の柔軟性**: 再接続の責任をモジュール使用者に委ねる設計。

## インストール

```bash
yarn add nem-symbol-websocket-monitor
```

または:

```bash
npm install nem-symbol-websocket-monitor
```

## 使用方法

### NEM WebSocket Monitor

```typescript
import { NemWebSocketMonitor } from 'nem-symbol-websocket-monitor';

const monitor = new NemWebSocketMonitor({
  host: 'localhost',
  ssl: false,
  timeout: 5000,
});

// チャネルにサブスクライブ
monitor.on('blocks', (message) => {
  console.log('New block:', message);
});

// エラーイベントの登録
monitor.onError((err) => {
  console.error('WebSocket error:', err);
});

// クローズイベントの登録
monitor.onClose((event) => {
  console.log('WebSocket closed:', event);
});

// 切断
monitor.disconnect();
```

### Symbol WebSocket Monitor

```typescript
import { SymbolWebSocketMonitor } from 'nem-symbol-websocket-monitor';

const monitor = new SymbolWebSocketMonitor({
  host: 'localhost',
  ssl: true,
  timeout: 5000,
});

// チャネルにサブスクライブ
monitor.on('transactions', (message) => {
  console.log('New transaction:', message);
});

// エラーイベントの登録
monitor.onError((err) => {
  console.error('WebSocket error:', err);
});

// クローズイベントの登録
monitor.onClose((event) => {
  console.log('WebSocket closed:', event);
});

// 切断
monitor.disconnect();
```

## API

### NEM WebSocket Monitor

#### コンストラクタ

```typescript
new NemWebSocketMonitor(options: NemWebSocketOptions);
```

- `options`: 接続設定。
  - `host`: 接続先ホスト。
  - `ssl`: SSL を使用するかどうか。
  - `timeout`: 接続タイムアウト（ミリ秒）。

#### メソッド

- `on(channel: NemChannel, callback: (message: string) => void, params?: { address?: string }): void`
  - 指定したチャネルにサブスクライブします。
- `off(channel: NemChannel, params?: { address?: string }): void`
  - 指定したチャネルのサブスクリプションを解除します。
- `onError(callback: (err: WebSocket.ErrorEvent) => void): void`
  - エラーイベントのコールバックを登録します。
- `onClose(callback: (event: WebSocket.CloseEvent) => void): void`
  - クローズイベントのコールバックを登録します。
- `disconnect(): void`
  - WebSocket 接続を切断します。

### Symbol WebSocket Monitor

#### コンストラクタ

```typescript
new SymbolWebSocketMonitor(options: SymbolWebSocketOptions);
```

- `options`: 接続設定。
  - `host`: 接続先ホスト。
  - `ssl`: SSL を使用するかどうか。
  - `timeout`: 接続タイムアウト（ミリ秒）。

#### メソッド

- `on(channel: SymbolChannel, callback: (message: WebSocket.MessageEvent) => void, params?: { address?: string }): void`
  - 指定したチャネルにサブスクライブします。
- `off(channel: SymbolChannel, params?: { address?: string }): void`
  - 指定したチャネルのサブスクリプションを解除します。
- `onError(callback: (err: WebSocket.ErrorEvent) => void): void`
  - エラーイベントのコールバックを登録します。
- `onClose(callback: (event: WebSocket.CloseEvent) => void): void`
  - クローズイベントのコールバックを登録します。
- `disconnect(): void`
  - WebSocket 接続を切断します。

## 注意点

- 再接続はモジュール使用者が管理する必要があります。
- サブスクリプションの登録や解除は、接続状態を確認して行ってください。

## ライセンス

[MIT](./LICENSE)
