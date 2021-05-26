---
title: TreeReporter.ts
nav_order: 21
parent: Modules
---

## TreeReporter overview

Added in v2.2.17

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [draw](#draw)
  - [toTreeBuiltin](#totreebuiltin)
  - [toTreeWith](#totreewith)

---

# utils

## draw

**Signature**

```ts
export declare const draw: (de: DE.DecodeError<DE.BuiltinE>) => string
```

Added in v2.2.17

## toTreeBuiltin

**Signature**

```ts
export declare const toTreeBuiltin: (de: DE.BuiltinE) => Tree<string>
```

Added in v2.2.17

## toTreeWith

**Signature**

```ts
export declare const toTreeWith: <E>(toTree: (e: E) => Tree<string>) => (de: DE.DecodeError<E>) => Tree<string>
```

Added in v2.2.17
