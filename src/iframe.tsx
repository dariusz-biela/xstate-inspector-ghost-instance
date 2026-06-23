import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserInspector } from '@statelyai/inspect';
import { App } from './main';

// Embed the real Stately inspector in an iframe on the page.
const iframe = document.createElement('iframe');
iframe.style.cssText = 'border:0;width:100%;height:70vh';
document.body.prepend(iframe);

// `url` is the final endpoint: it skips the /inspect -> /registry/inspect 307 redirect
// that breaks the embedded handshake.
const { inspect } = createBrowserInspector({ iframe, url: 'https://stately.ai/registry/inspect' });

// Render — i.e. create the actors — only after the iframe has loaded AND connected.
// In iframe mode the adapter learns its target window on `load` but flushes buffered
// events on `@statelyai.connected`; creating actors earlier posts their `@xstate.actor`
// registrations to a not-yet-ready window, where they are dropped. A later snapshot then
// reaches the inspector for an actor it never registered and it crashes reading that
// actor's `config`. See statelyai/inspect#36. (The popup transport needs none of this:
// window.open returns the target window synchronously.)
const root = document.getElementById('root');
let loaded = false;
let connected = false;
let done = false;
function render() {
  if (done || !root || !loaded || !connected) return;
  done = true;
  createRoot(root).render(
    <StrictMode>
      <App inspect={inspect} />
    </StrictMode>,
  );
}
iframe.addEventListener('load', () => {
  loaded = true;
  render();
});
addEventListener('message', (event) => {
  if (event.data?.type === '@statelyai.connected') {
    connected = true;
    render();
  }
});
