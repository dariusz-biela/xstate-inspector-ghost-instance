import { useMachine } from '@xstate/react';
import { createMachine, type InspectionEvent, type Observer } from 'xstate';

// Plain application code — a machine and a component using useMachine. The `inspect`
// observer is the only seam the demo wires in; in a real app it comes from your inspector.
export const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } },
  },
});

export function App({ inspect }: { inspect?: Observer<InspectionEvent> }) {
  const [snapshot, send] = useMachine(toggleMachine, { inspect });
  return (
    <p style={{ fontFamily: 'system-ui, sans-serif', color: '#334155' }}>
      <button onClick={() => send({ type: 'TOGGLE' })}>{String(snapshot.value)}</button>{' '}
      <small style={{ color: '#94a3b8' }}>
        click to toggle the real actor — the ghost stays frozen in the inspector above
      </small>
    </p>
  );
}
