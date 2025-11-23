import { SymbolChannel } from './symbol.types';

/**
 * Symbolチャネルパス定義 / Symbol Channel Path Definitions
 */
export const symbolChannelPaths: Record<SymbolChannel, { subscribe: (address?: string) => string }> = {
  block: { subscribe: () => 'block' },
  finalizedBlock: { subscribe: () => 'finalizedBlock' },
  confirmedAdded: { subscribe: (address?: string) => (address ? `confirmedAdded/${address}` : 'confirmedAdded') },
  unconfirmedAdded: { subscribe: (address?: string) => (address ? `unconfirmedAdded/${address}` : 'unconfirmedAdded') },
  unconfirmedRemoved: { subscribe: (address?: string) => (address ? `unconfirmedRemoved/${address}` : 'unconfirmedRemoved') },
  partialAdded: { subscribe: (address?: string) => (address ? `partialAdded/${address}` : 'partialAdded') },
  partialRemoved: { subscribe: (address?: string) => (address ? `partialRemoved/${address}` : 'partialRemoved') },
  cosignature: { subscribe: (address?: string) => (address ? `cosignature/${address}` : 'cosignature') },
  status: { subscribe: (address?: string) => (address ? `status/${address}` : 'status') },
} as const;
