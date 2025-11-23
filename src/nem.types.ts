/**
 * NEMチャネルタイプ / NEM Channel types:
 * - newBlock: 生成されたブロックの通知 / Generated Block Notification
 * - blocks: 生成されたブロックの全情報 / All information about the generated block
 * - account: アカウントの状態更新通知 / Account Status Update Notification
 * - accountMosaic: アカウントのモザイク保有量更新通知 / Account Mosaic Balance Update Notification
 * - accountMosaicDef: アカウントのモザイク情報量更新通知 / Account Mosaic Information Update Notification
 * - accountNamespace: アカウントのネームスペース情報量更新通知 / Account Namespace Information Update Notification
 * - unconfirmed: 未承認トランザクション通知 / Unconfirmed Transaction Notification
 * - transactions: 承認トランザクション通知 / Confirmed Transaction Notification
 * - recenttransactions: 直近トランザクション通知 / Recent Transaction Notification
 */
export type NemChannel =
  | 'newBlock'
  | 'blocks'
  | 'account'
  | 'accountMosaic'
  | 'accountMosaicDef'
  | 'accountNamespace'
  | 'unconfirmed'
  | 'transactions'
  | 'recenttransactions';

/**
 * NEMウェブソケットモニターオプション / NEM WebSocket Monitor Options
 */
export interface NemWebSocketOptions {
  host: string;
  timeout?: number;
  ssl?: boolean;
}
