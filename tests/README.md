# Tests

Unit/component tests live **co-located** next to the code they cover
(e.g. `src/utils/__tests__/whatsapp.test.ts`). This folder holds shared test
setup and helpers as the suite grows in Phase 6 (QA/quality).

Run: `npm test`.

Scaffold coverage so far: pure utils (`whatsapp`). Phase 6 adds hooks (with a
test `QueryClient`), role guards, optimistic favorites, and key Design System
components.
