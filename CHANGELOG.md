# Changelog

> **Tags:**
>
> - [New Feature]
> - [Bug Fix]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]
> - [Experimental]

**Note**: Gaps between patch versions are faulty/broken releases. **Note**: A feature tagged as Experimental is in a
high state of flux, you're at risk of it changing without notice.

# 1.3.0

- **New Feature**
  - add `TaggedUnionType` (@gcanti)

# 1.2.1

- **Polish**
  - allow recursive types in tagged unions (@gcanti)

# 1.2.0

- **New Feature**
  - add `void` runtime type (@gcanti)

# 1.1.5

- **Bug Fix**
  - partial combinator should preserve additional properties while encoding, fixes #179 (@gcanti)
- **Polish**
  - use `useIdentity` when possible (@gcanti)

# 1.1.4

- **Internal**
  - fix broken build with `typescript@2.9.1`, closes #174 (@gcanti)

# 1.1.3

- **Internal**
  - upgrade to `typings-checker@2.0.0` (@gcanti)

# 1.1.2

- **Bug Fix**
  - fix `alias` implementation (@gcanti)
  - handle exact types in `isTagged` (@gcanti)

# 1.1.1

- **Experimental**
  - add `clean` / `alias` functions, closes #149 (@gcanti)
  - add `exact` combinator (@gcanti)
    - the `strict` combinator is deprecated
  - remove `optional` combinator (@gcanti)
    - it doesn't play well with advanced combinators, see [here](https://github.com/gcanti/io-ts/issues/140) for a discussion

# 1.0.6

- **Bug Fix**
  - `taggedUnion` fails to decode when tag values are not string literals, fix #161 (@gcanti)

# 1.0.5

- **Bug Fix**
  - workaround for upstream TypeScript bug 14041 (wrong generated declarations) (@gcanti)
- **Internal**
  - optimize InterfaceType.encode (@gcanti)
  - use definite assignment assertion for phantom fields (@gcanti)

# 1.0.4

- **Bug Fix**
  - make `Context` readonly (@gcanti)
- **Internal**
  - optimizations, #137 (@gcanti, @sledorze)

# 1.0.3

- **Internal**
  - optimizations, #134 (@gcanti, @sledorze)

# 1.0.2

- **Bug Fix**
  - fix `OutputOfPartialProps` name (@gcanti)

# 1.0.1

- **Bug Fix**
  - fix `AnyType` by extending `Type<any>` (@gcanti)

# 1.0.0

- **Breaking Change**
  - upgrade to `fp-ts@1.0.0`
  - see https://github.com/gcanti/io-ts/pull/112 (@gcanti)

# 0.9.8

- **New Feature**
  - add decode and deprecate top level validate (@gcanti)
- **Internal**
  - when checking validations use methods instead of top level functions (@gcanti)

# 0.9.7

- **New Feature**
  - add `taggedUnion` combinator (@gcanti, @sledorze)

# 0.9.6

- **New Feature**
  - `recursive` combinator
    - add support for mutually recursive types, closes #114 (@gcanti)
    - make it safer: `RT` now must extend `Type<mixed, A>` (@gcanti)

# 0.9.5

- **New Feature**
  - add `mixed` type (@gcanti)
  - replace `any` with `mixed` in all input type parameters (@gcanti)
    ```diff
    -export class StringType extends Type<any, string> {
    +export class StringType extends Type<mixed, string> {
    }
    ```

# 0.9.4

- **Bug Fix**
  - strict: should succeed validating an undefined field, closes #106 (@gcanti)

# 0.9.3

- **Bug Fix**
  - revert 37c74a5e2038de063a950f9ba8d18b1f132ef450, closes #8 (@gcanti)

# 0.9.2

- **New Feature**
  - add `Decoder` / `Encoder` interfaces (@sledorze, @gcanti)
- **Internal**
  - perf optimizations (@sledorze, @gcanti)

# 0.9.1

- **Bug Fix**
  - make all classes "dumb", fix #95 (@gcanti)

# 0.9.0

- **Breaking Change**
  - remove `t.map` and `t.mapWithName` (in general doesn't look serializable, needs more investigation)
  - remove `t.prism` (in general doesn't look serializable, needs more investigation)
  - change `Type` from interface to class and add `S` type parameter
    - remove `t._A`
  - add `Type#serialize`
  - add `Type#is` (in order to serialize unions and while we're at it, looks useful anyway)
  - remove `t.is` (now that there's `Type#is` is misleading)
- **Experimental**
  - add Flowtype support (@gcanti)

# 0.8.2

- **New Feature**
  - add `object` type, closes #86 (@gcanti)

# 0.8.1

- **New Feature**
  - add `strict` combinator, closes #84 (@phiresky, @gcanti)

# 0.8.0

- **Breaking Change**
  - upgrade `fp-ts` dependency (@gcanti)

# 0.7.2

- **Bug Fix**
  - tag recursive types, fix #80 (@gcanti)

# 0.7.1

- **Bug Fix**
  - incorrect compile time type for dictionary, fix #75 (@gcanti)

# 0.7.0

- **Breaking Change**
  - upgrade to latest fp-ts (0.5.1) (@gcanti)

# 0.6.2

- **New Feature**
  - add aliases for `null` and `interface`, closes #63 (@gcanti)

# 0.6.1

- **Internal**
  - handle latest fp-ts (0.4.3) (@gcanti)

# 0.6.0

- **Breaking Change**
  - upgrade to latest fp-ts (0.4.0) (@gcanti)
- **Internal**
  - allow for infinite unions (@gcanti)

# 0.5.1

- **Bug Fix**
  - export and rename `interfaceType` to `_interface`, fix #57 (@gcanti)

# 0.5.0

- **Breaking Change**
  - `Type` is now an interface
  - types no more own a `is` method, use `t.is` instead
  - unions no more own a `fold` method
  - `Reporter`, `PathReporter`, `ThrowReporter` are now top level modules

# 0.4.0

- **Breaking Change**
  - upgrade to latest `fp-ts` (`io-ts` APIs are not changed though) (@gcanti)
  - drop `lib-jsnext` folder

# 0.3.2

- **Bug Fix**
  - remove excess overloadings, fix #43 (@gcanti)

# 0.3.1

- **New Feature**
  - add mapWithName and Functor instance, fix #37 (@gcanti)
  - add prism combinator, fix #41 (@gcanti)

# 0.3.0

This is a breaking change _only_ if you are using fp-ts APIs

- **Breaking Change**
  - upgrade to latest fp-ts v0.2 (@gcanti)

# 0.2.3

- **Internal**
  - upgrade to fp-ts v0.1 (@gcanti)

# 0.2.2

- **New Feature**
  - add `partial` combinator (makes optional props possible)
  - add `readonly` combinator (values are not frozen in production)
  - add `readonlyArray` combinator (values are not frozen in production)
  - add `never` type
- **Breaking Changes**
  - remove `maybe` combinator, can be defined in userland as
    ```ts
    export function maybe<RT extends t.Any>(
      type: RT,
      name?: string
    ): t.UnionType<[RT, typeof t.null], t.TypeOf<RT> | null> {
      return t.union([type, t.null], name)
    }
    ```
- **Polish**
  - export `pathReporterFailure` function from default reporters
- **Bug Fix**
  - revert pruning excess properties (see https://github.com/gcanti/io-ts/pull/27 for context)
  - revert `intersection` combinator accepting only `InterfaceType`s
- **Experimental**
  - Pattern matching / catamorphism for unions

# 0.1.0

- **New Feature**

  - add support for jsnext
  - add `Integer` type

- **Breaking Changes**
  - `t.Object` type. Renamed to `t.Dictionary`, now accepts arrays so is fully equivalent to `{ [key: string]: any }`.
  - `t.instanceOf` combinator. Removed.
  - `t.object` combinator. Renamed to `t.interface`. `ObjectType` to `InterfaceType`. Excess properties are now pruned.
  - `mapping` combinator. Renamed to `dictionary`. `MappingType` to `DictionaryType`.
  - `intersection` combinator. Due to the new excess property pruning in `t.interface` now only accept `InterfaceType`s.
  - API `isSuccess` removed, use `either.isRight` instead
  - API `isFailure` removed, use `either.isLeft` instead
  - API `fromValidation` removed

# 0.0.2

- **Bug Fix**
  - reverse overloading definitions for unions, intersections and tuples, fix inference bug

# 0.0.1

Initial release
