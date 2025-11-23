/**
 * Symbolチャネルタイプ / Symbol Channel types:
 * - block: 生成されたブロックの通知 / Generated Block Notification
 * - finalizedBlock: ファイナライズ通知 / Finalized Block Notification
 * - confirmedAdded: 承認トランザクション通知 / Confirmed Transaction Notification
 * - unconfirmedAdded: 未承認トランザクション通知 / Unconfirmed Transaction Notification
 * - unconfirmedRemoved: 未承認トランザクション削除通知 / Unconfirmed Transaction Removal Notification
 * - partialAdded: パーシャル追加通知 / Partial Transaction Addition Notification
 * - partialRemoved: パーシャル削除通知 / Partial Transaction Removal Notification
 * - cosignature: 連署要求通知 / Cosignature Request Notification
 * - status: ステータス通知 / Status Notification
 */
export type SymbolChannel =
  | 'block'
  | 'finalizedBlock'
  | 'confirmedAdded'
  | 'unconfirmedAdded'
  | 'unconfirmedRemoved'
  | 'partialAdded'
  | 'partialRemoved'
  | 'cosignature'
  | 'status';

/**
 * Symbolウェブソケットモニターオプション / Symbol WebSocket Monitor Options
 */
export interface SymbolWebSocketOptions {
  host: string;
  timeout?: number;
  ssl?: boolean;
}
