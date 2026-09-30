# Phase 1 UI Handoff

This document lists the components, their props, and states for data wiring in later phases.

## Components Inventory

### UI Kit (`/components/ui`)
- `Button`: Primary, secondary, quiet. Sizes: default, big.
- `Card`: Standard paper card.
- `EmptyState`: Reusable empty state pattern (`title`, `description`, `icon`, `action`).

### Landing Page (`/components/landing/Hero.tsx`)
- Props: None (static layout, localized text).
- States: Idle.

### KrishiSahay Flow (`/components/krishi`)
- `CropStepper`:
  - Props: `onComplete`, `initialData`.
  - States: Select crop, select location, select stage (slider).
- `EvidenceTrail`:
  - Props: `events: EvidenceEvent[]`, `status: "idle" | "running" | "done" | "error"`.
  - States: Shows empty/idle in Phase 1.
- `CropBriefView`:
  - Props: `brief: CropBrief | null`.
  - States: If `null`, shows `EmptyState`. If data, renders `MarketIntel`, `ActionsList`, etc.

### MediShield Flow (`/components/medi`)
- `BillUpload`:
  - Props: `onUpload`, `onRedact`.
  - States: Idle, File selected, Redacting.
- `ExtractionReview`:
  - Props: `bill: Bill | null`, `onConfirm`.
  - States: If `null`, editable fields are empty. Blocks analysis until confirmed.
- `BillResults`:
  - Props: `flags: Flag[]`, `references: any[]`.
  - States: Renders `EmptyState` if no analysis yet.
- `LetterEditor`:
  - Props: `initialText`.
  - States: Editable text area, preview mode.

_More details will be appended as components are fully built._

### KrishiSahay Component States
- **CropStepper**: Contains local state for step 1-4. OnComplete signals parent to transition.
- **EvidenceTrail**: Accepts 'status' prop. Currently only renders 'idle' pattern as per phase 1.
- **BriefView**: Expects 'brief' prop (CropBrief schema). If null, renders 5 specific empty state blocks.


### MediShield Component States
- **PrivacyNotice**: Static text, accepts 'onAccept'.
- **BillUpload**: Drag/drop zone, accepts 'onFileSelect'.
- **RedactTool**: HTML Canvas wrapper. Flattens boxes into DataURL for 'onComplete'.
- **ExtractionReview**: Split view. Left side shows DataURL. Right side has manual inputs for Phase 1. Blocks 'onConfirm' until filled.
- **BillResults**: Renders EmptyState components for breakdown, flags, references, and routes as there is no analysis in Phase 1.
- **LetterEditor**: Textarea for editable text with live A4 CSS preview. Print uses standard window.print() with CSS print queries.


### System & Shared Components
- **Dashboard**: Combines module entry points and a case timeline (renders EmptyState in Phase 1).
- **HelpPage**: Static documentation and safety limits.
- **JudgePanel**: Fixed widget showing SerpApi counters, toggled by '?demo=1'.
- **System States**: Includes a custom 404 Not Found, a global Error Boundary with a reset action, and a global Loading spinner.

