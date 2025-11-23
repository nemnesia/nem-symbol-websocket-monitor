import { NemWebSocketMonitor } from './NemWebSocketMonitor';

const nemWsm = new NemWebSocketMonitor({ host: 't.nis1.rerena.nemnesia.com', ssl: false });

nemWsm.on('newBlock', (message) => {
  console.log('New block message received:', message);
});
nemWsm.on('blocks', (message) => {
  console.log('Blocks message received:', message);
});
nemWsm.on(
  'account',
  (message) => {
    console.log('Account message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'accountMosaic',
  (message) => {
    console.log('Account Mosaic message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'accountMosaicDef',
  (message) => {
    console.log('Account Mosaic Definition message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'accountNamespace',
  (message) => {
    console.log('Account Namespace message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'unconfirmed',
  (message) => {
    console.log('Unconfirmed transaction message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'transactions',
  (message) => {
    console.log('Transactions message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);
nemWsm.on(
  'recenttransactions',
  (message) => {
    console.log('Recent Transactions message received:', message);
  },
  { address: 'TALRNX5E57GQFNN2HIOBC7EGYFXRK2D22YGORXUQ' }
);

nemWsm.onError((err) => {
  console.error('WebSocket error:', err);
});

nemWsm.onClose((event) => {
  console.log('WebSocket connection closed:', event);
});

// import {Client} from "@stomp/stompjs";
// import WebSocket from 'isomorphic-ws';

// const client = new Client({
//   debug: (str) => console.debug(str),
//   connectionTimeout: 5000,
//   reconnectDelay: 5000,
//   webSocketFactory: () => new WebSocket(`ws://sakia.nis1.harvestasya.com:7778/w/messages/websocket`),
// });
// client.activate();
// client.onConnect = () => {
//   console.log('✅ Connected to NEM WebSocket');

//   // 最新ブロック情報を購読
//   client.subscribe('/blocks', (message) => {
//     const data = JSON.parse(message.body);
//     console.log('🧱 New Block:', data);
//   });

//   // ブロック高の変化も購読
//   client.subscribe('/blocks/new', (message) => {
//     const data = JSON.parse(message.body);
//     console.log('📈 Block Height:', data);
//   });
// };
