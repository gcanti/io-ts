---
title: Reporter.ts
nav_order: 3
---

**Table of contents**

- [Reporter (interface)](#reporter-interface)# Reporter (interface)

**Signature**

```ts
export interface Reporter<A> {
  report: (validation: Validation<any>) => A
}
```

Added in v1.0.0
