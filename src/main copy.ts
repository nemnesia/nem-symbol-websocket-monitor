import {SymbolWebSocketMonitor} from "./SymbolWebSocketMonitor";

const symbolWsm = new SymbolWebSocketMonitor({ host: 'sakia.harvestasya.com', ssl: true });

symbolWsm.on('block', (message) => {
  console.log('New block message received:', message);
});
symbolWsm.on('finalizedBlock', (message) => {
  console.log('Finalized block message received:', message);
});
symbolWsm.on('confirmedAdded', (message) => {
  console.log('Confirmed transaction added message received:', message);
});
symbolWsm.on('unconfirmedAdded', (message) => {
  console.log('Unconfirmed transaction added message received:', message);
});
symbolWsm.on('unconfirmedRemoved', (message) => {
  console.log('Unconfirmed transaction removed message received:', message);
});
symbolWsm.on('partialAdded', (message) => {
  console.log('Partial transaction added message received:', message);
});
symbolWsm.on('partialRemoved', (message) => {
  console.log('Partial transaction removed message received:', message);
});
symbolWsm.on('cosignature', (message) => {
  console.log('Cosignature request message received:', message);
});
symbolWsm.on('status', (message) => {
  console.log('Status message received:', message);
});

symbolWsm.onError((err) => {
  console.error('WebSocket error:', err);
});

symbolWsm.onClose((event) => {
  console.log('WebSocket connection closed:', event);
});
