---
title: PEncoder.ts
nav_order: 8
parent: Modules
---

# PEncoder overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [PEncoder (interface)](#pencoder-interface)
- [OutputOf (type alias)](#outputof-type-alias)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [array](#array)
- [contramap](#contramap)
- [id](#id)
- [intersection](#intersection)
- [lazy](#lazy)
- [nullable](#nullable)
- [partial](#partial)
- [pencoder](#pencoder)
- [record](#record)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)

---

# PEncoder (interface)

**Signature**

```ts
export interface PEncoder<O, A> {
  readonly encode: (a: A) => O
}
```

Added in v2.2.3

# OutputOf (type alias)

**Signature**

```ts
export type OutputOf<E> = E extends PEncoder<infer O, any> ? O : never
```

Added in v2.2.3

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends PEncoder<any, infer A> ? A : never
```

Added in v2.2.3

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# URI

**Signature**

```ts
export declare const URI: 'PEncoder'
```

Added in v2.2.3

# array

**Signature**

```ts
export declare function array<O, A>(items: PEncoder<O, A>): PEncoder<Array<O>, Array<A>>
```

Added in v2.2.3

# contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => <E>(fa: PEncoder<E, A>) => PEncoder<E, B>
```

Added in v2.2.3

# id

**Signature**

```ts
export declare function id<A>(): PEncoder<A, A>
```

Added in v2.2.3

# intersection

**Signature**

```ts
export declare function intersection<O, A, P, B>(left: PEncoder<O, A>, right: PEncoder<P, B>): PEncoder<O & P, A & B>
```

Added in v2.2.3

# lazy

**Signature**

```ts
export declare function lazy<O, A>(f: () => PEncoder<O, A>): PEncoder<O, A>
```

Added in v2.2.3

# nullable

**Signature**

```ts
export declare function nullable<O, A>(or: PEncoder<O, A>): PEncoder<null | O, null | A>
```

Added in v2.2.3

# partial

**Signature**

```ts
export declare function partial<P extends Record<string, PEncoder<any, any>>>(
  properties: P
): PEncoder<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>>
```

Added in v2.2.3

# pencoder

**Signature**

```ts
export declare const pencoder: Contravariant2<'PEncoder'>
```

Added in v2.2.3

# record

**Signature**

```ts
export declare function record<O, A>(codomain: PEncoder<O, A>): PEncoder<Record<string, O>, Record<string, A>>
```

Added in v2.2.3

# sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <M extends Record<string, PEncoder<any, any>>>(members: M) => PEncoder<OutputOf<M[keyof M]>, TypeOf<M[keyof M]>>
```

Added in v2.2.3

# tuple

**Signature**

```ts
export declare function tuple<C extends ReadonlyArray<PEncoder<any, any>>>(
  ...components: C
): PEncoder<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }>
```

Added in v2.2.3

# type

**Signature**

```ts
export declare function type<P extends Record<string, PEncoder<any, any>>>(
  properties: P
): PEncoder<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v2.2.3
