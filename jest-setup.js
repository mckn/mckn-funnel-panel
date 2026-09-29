// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

// jsdom does not implement MessageChannel, which react-dom/server needs since React 19.
// A real MessageChannel (e.g. from worker_threads) keeps the event loop alive and hangs Jest, so
// this is a minimal same-tick polyfill instead.
class MessagePortPolyfill {
  onmessage = null;
  postMessage(data) {
    setTimeout(() => this.onmessage?.({ data }));
  }
}

class MessageChannelPolyfill {
  port1 = new MessagePortPolyfill();
  port2 = new MessagePortPolyfill();
}

Object.assign(global, { MessageChannel: MessageChannelPolyfill });
