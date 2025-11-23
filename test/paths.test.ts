import { describe, expect, it } from 'vitest';
import * as index from '../src/index';
import { nemChannelPaths } from '../src/nem/nemChannelPaths';
import { symbolChannelPaths } from '../src/symbol/symbolChannelPaths';

describe('Channel path definitions', () => {
  describe('Nem', () => {
    it('nemChannelPaths: subscribe関数はアドレス付きで正しいパスを生成する / nemChannelPaths: function subscribe produces correct path with address', () => {
      const res =
        typeof nemChannelPaths.account.subscribe === 'function'
          ? nemChannelPaths.account.subscribe('ABC123')
          : nemChannelPaths.account.subscribe;
      expect(res).toBe('/account/ABC123');
    });

    it('nemChannelPaths: accountMosaic およびその他の関数パスは期待される文字列を生成する / nemChannelPaths: accountMosaic and other function paths produce expected strings', () => {
      expect(
        typeof nemChannelPaths.accountMosaic.subscribe === 'function'
          ? nemChannelPaths.accountMosaic.subscribe('ADDR')
          : nemChannelPaths.accountMosaic.subscribe
      ).toBe('/account/mosaic/owned/ADDR');
      expect(
        typeof nemChannelPaths.accountMosaicDef.subscribe === 'function'
          ? nemChannelPaths.accountMosaicDef.subscribe('ADDR')
          : nemChannelPaths.accountMosaicDef.subscribe
      ).toBe('/account/mosaic/owned/definition/ADDR');
      expect(
        typeof nemChannelPaths.accountNamespace.subscribe === 'function'
          ? nemChannelPaths.accountNamespace.subscribe('ADDR')
          : nemChannelPaths.accountNamespace.subscribe
      ).toBe('/account/namespace/owned/ADDR');
      expect(
        typeof nemChannelPaths.unconfirmed.subscribe === 'function'
          ? nemChannelPaths.unconfirmed.subscribe('ADDR')
          : nemChannelPaths.unconfirmed.subscribe
      ).toBe('/unconfirmed/ADDR');
      expect(
        typeof nemChannelPaths.transactions.subscribe === 'function'
          ? nemChannelPaths.transactions.subscribe('ADDR')
          : nemChannelPaths.transactions.subscribe
      ).toBe('/transactions/ADDR');
      expect(
        typeof nemChannelPaths.recenttransactions.subscribe === 'function'
          ? nemChannelPaths.recenttransactions.subscribe('ADDR')
          : nemChannelPaths.recenttransactions.subscribe
      ).toBe('/recenttransactions/ADDR');
    });

    it('nemChannelPaths: 定数のsubscribeパスは正しい / nemChannelPaths: constant subscribe paths are correct', () => {
      expect(nemChannelPaths.newBlock.subscribe).toBe('/blocks/new');
      expect(nemChannelPaths.blocks.subscribe).toBe('/blocks');
    });
  });

  describe('Symbol', () => {
    it('symbolChannelPaths: 条件付きsubscribeはアドレスを正しく処理する / symbolChannelPaths: conditional subscribe handles address correctly', () => {
      expect(symbolChannelPaths.confirmedAdded.subscribe('XYZ')).toBe('confirmedAdded/XYZ');
      expect(symbolChannelPaths.confirmedAdded.subscribe()).toBe('confirmedAdded');
      expect(symbolChannelPaths.unconfirmedAdded.subscribe('A')).toBe('unconfirmedAdded/A');
      expect(symbolChannelPaths.unconfirmedAdded.subscribe()).toBe('unconfirmedAdded');
      expect(symbolChannelPaths.unconfirmedRemoved.subscribe('B')).toBe('unconfirmedRemoved/B');
      expect(symbolChannelPaths.unconfirmedRemoved.subscribe()).toBe('unconfirmedRemoved');
      expect(symbolChannelPaths.partialAdded.subscribe('C')).toBe('partialAdded/C');
      expect(symbolChannelPaths.partialAdded.subscribe()).toBe('partialAdded');
      expect(symbolChannelPaths.partialRemoved.subscribe('D')).toBe('partialRemoved/D');
      expect(symbolChannelPaths.partialRemoved.subscribe()).toBe('partialRemoved');
      expect(symbolChannelPaths.cosignature.subscribe('E')).toBe('cosignature/E');
      expect(symbolChannelPaths.cosignature.subscribe()).toBe('cosignature');
      expect(symbolChannelPaths.status.subscribe('F')).toBe('status/F');
      expect(symbolChannelPaths.status.subscribe()).toBe('status');
      expect(symbolChannelPaths.block.subscribe()).toBe('block');
      expect(symbolChannelPaths.finalizedBlock.subscribe()).toBe('finalizedBlock');
    });

    it('indexはモニターと型をエクスポートする / index exports monitors and types', () => {
      expect(index.NemWebSocketMonitor).toBeDefined();
      expect(index.SymbolWebSocketMonitor).toBeDefined();
    });
  });
});
