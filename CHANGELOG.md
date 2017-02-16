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

