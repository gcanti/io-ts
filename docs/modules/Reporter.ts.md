---
title: Reporter.ts
nav_order: 11
parent: Modules
---

## Reporter overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Reporter (interface)](#reporter-interface)

---

# utils

## Reporter (interface)

**Signature**

```ts
export interface Reporter<A> {
  report: (validation: Validation<any>) => A
}
```

Added in v1.0.0
