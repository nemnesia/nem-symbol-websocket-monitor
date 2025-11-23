interface Meta {
  innerHash: any;
  id: number;
  hash: { data: string };
  height: bigint;
}

export interface WsTransaction {
  type: number;
  version: number;
  timestamp: bigint;
  signerPublicKey: string;
  signaature: string;
  fee: bigint;
  deadline: bigint;
}

export interface WsAccountKeyLinkTransactionV1 extends WsTransaction {
  linkAction: string;
  remotePublicKey: string;
}

export interface WsMosaicSupplyChangeTransactionV1 extends WsTransaction {
  mosaicId: { namespaceId: string; name: string };
  action: string;
  delta: bigint;
}

export interface WsMultisigAccountModificationTransactionV2 extends WsTransaction {
  modifications: [];
}

export interface WsCosignatureV1 extends WsTransaction {
  otherTransactionHash: string;
  multisigAccountAddress: string;
}

export interface WsMultisigTransactionV1 extends WsTransaction {
  innerTransaction: WsTransaction;
  cosignatures: [];
}

export interface WsNamespaceRegistrationTransactionV1 extends WsTransaction {
  rentalFeeSink: string;
  rentalFee: bigint;
  name: string;
  parentName: string;
}

export interface WsTransferTransactionV1 extends WsTransaction {
  recipientAddress: string;
  amount: bigint;
  message: { payload: string; type: number };
}

export interface WsTransferTransactionV2 extends WsTransferTransactionV1 {
  mosaics: { namespaceId: string; name: string }[];
}

export interface WsNewBlock {
  height: bigint;
}

export interface WsBlocks {
  meta: Meta;
  transaction: WsTransaction;
}

export interface WsUnconfirmed {
  meta: Meta;
  transaction: WsTransaction;
}

export interface WsTransactions {
  meta: Meta;
  transaction: WsTransaction;
}

export interface WsAccount {
  meta: { cosignatories: []; cosignatoryOf: []; status: string; remoteStatus: string };
  account: WsTransaction;
}

export interface WsAccountMosaic {
  quantity: bigint;
  mosaicId: { namespaceId: string; name: string };
}

export interface WsAccountMosaicDef {
  mosaicDefinition: {
    creator: string;
    description: string;
    id: { namespaceId: string; name: string };
    properties: { name: string; value: string }[];
    levy: { fee: bigint; recipient: string; type: number; mosaicId: { namespaceId: string; name: string } };
  };
  supply: bigint;
}

export interface WsAccountNamespace {
  owner: string;
  fqn: string;
  height: bigint;
}

export interface WsRecentTransactions {
  data: {
    meta: Meta;
    transaction: WsTransaction;
  }[];
}
