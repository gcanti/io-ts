---
title: Reporter.ts
nav_order: 10
parent: Modules
---

# Reporter overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Reporter (interface)](#reporter-interface)

---

# Reporter (interface)

**Signature**

```ts
export interface Reporter<A> {
  report: (validation: Validation<any>) => A
}
```

Added in v1.0.0
