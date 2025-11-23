import { NemChannel } from './nem.types';

/**
 * NEMチャネルパス定義 / NEM Channel Path Definitions
 */
// eslint-disable-next-line no-unused-vars
export const nemChannelPaths: Record<NemChannel, { subscribe: string | ((address?: string) => string); publish?: string }> = {
  newBlock: { subscribe: '/blocks/new' },
  blocks: { subscribe: '/blocks' },
  account: {
    subscribe: (address?: string) => `/account/${address}`,
    publish: '/w/api/account/get',
  },
  accountMosaic: {
    subscribe: (address?: string) => `/account/mosaic/owned/${address}`,
    publish: '/w/api/account/mosaic/owned',
  },
  accountMosaicDef: {
    subscribe: (address?: string) => `/account/mosaic/owned/definition/${address}`,
    publish: '/w/api/account/mosaic/owned/definition',
  },
  accountNamespace: {
    subscribe: (address?: string) => `/account/namespace/owned/${address}`,
    publish: '/w/api/account/namespace/owned',
  },
  unconfirmed: { subscribe: (address?: string) => `/unconfirmed/${address}` },
  transactions: { subscribe: (address?: string) => `/transactions/${address}` },
  recenttransactions: {
    subscribe: (address?: string) => `/recenttransactions/${address}`,
    publish: '/w/api/account/transfers/all',
  },
} as const;
