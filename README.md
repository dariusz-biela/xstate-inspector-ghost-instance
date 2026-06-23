# XState inspector — ghost actor (minimal repro)

Under React Strict Mode, `useMachine` runs `createActor` **twice** (its `useState`
initializer is double-invoked), but only one actor is started. XState registers both with
the inspector via the `@xstate.actor` event emitted in the Actor constructor, so the
never-started one lingers in the inspector forever in its initial state — a "ghost".

```bash
npm install
npm run dev   # open http://localhost:5173
```

The real Stately inspector is embedded in an iframe and lists **two** `toggle` actors for
one mounted component. Click the button to drive the real actor; the other one — the ghost
— stays frozen in `inactive`.

## Two files

| File              | Role                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `src/main.tsx`    | The application: the machine and the `useMachine` component. Plain XState.  |
| `src/iframe.tsx`  | The demo: embeds the real `@statelyai/inspect` inspector and renders the app. |

## Why the ghost appears

1. `useMachine` creates the actor inside a `useState` initializer (via `useIdleActorRef`):
   `useState(() => createActor(logic, options))`.
2. React **Strict Mode** double-invokes that initializer, so `createActor()` runs **twice**;
   React keeps only one of the two actors.
3. XState announces every actor with `@xstate.actor` **in the `Actor` constructor — before
   `start()`**, so both registrations reach the inspector.
4. Only the kept actor is `start()`ed (in a `useEffect`) and emits `@xstate.snapshot`. The
   discarded actor stays registered but never starts: the ghost.

`@xstate.actor` fires on construction, `@xstate.snapshot` only on start. Remove `<StrictMode>`
in `src/iframe.tsx` and the ghost disappears, which confirms the cause.

## Note on the iframe embed (statelyai/inspect#36)

Embedding the inspector in an iframe needs two things that a popup
(`createBrowserInspector()`) does not:

1. **`url: 'https://stately.ai/registry/inspect'`** — the default `/inspect` issues a 307
   redirect that breaks the embedded handshake.
2. **Create the actors only after the iframe has loaded *and* connected.** Otherwise the
   `@xstate.actor` registrations race the handshake, get dropped, and the inspector later
   crashes with `Cannot read properties of undefined (reading 'config')` when a snapshot
   arrives for an actor it never registered. `src/iframe.tsx` gates the render on both
   events.

## Versions

- `xstate@5.32.1`, `@xstate/react@5.0.5`, `@statelyai/inspect@0.7.2`, `react@18.3.1`

## Related upstream issues

- statelyai/inspect#44 — Strict Mode / re-renders break the inspector (the ghost).
- statelyai/inspect#36 — embedding the inspector in an iframe (the handshake race).
