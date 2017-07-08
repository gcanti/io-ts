# Changelog

> **Tags:**
> - [New Feature]
> - [Bug Fix]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]
> - [Experimental]

**Note**: Gaps between patch versions are faulty/broken releases.
**Note**: A feature tagged as Experimental is in a high state of flux, you're at risk of it changing without notice.

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

This is a breaking change *only* if you are using fp-ts APIs

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
    export function maybe<RT extends t.Any>(type: RT, name?: string): t.UnionType<[RT, typeof t.null], t.TypeOf<RT> | null> {
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

