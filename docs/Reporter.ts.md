---
title: Reporter.ts
nav_order: 3
---

Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Reporter](#reporter)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Reporter

**Signature** (interface)

```ts
export interface Reporter<A> {
  report: (validation: Validation<any>) => A
}
```

Added in v1.0.0
