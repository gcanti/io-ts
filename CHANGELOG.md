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
- **Breaking Changes**
  - `t.Object` type. Renamed to `t.Index`, now accepts arrays so is fully equivalent to `{ [key: string]: any }`.
  - `t.instanceOf` combinator. Removed.
  - `t.object` combinator. Renamed to `t.interface`. `ObjectType` to `InterfaceType`. Excess properties are now checked:
    ```ts
    const Person = t.interface({ name: t.string })
    console.log(t.validate({ name: 'Giulio', a: 1 }, Person)) // => Left(...)
    ```
  - `mapping` combinator. Renamed to `index`. `MappingType` to `IndexType`.
  - `intersection` combinator. Due to the new excess property checks in `t.interface` now only accept `InterfaceType`s.

# 0.0.2

- **Bug Fix**
  - reverse overloading definitions for unions, intersections and tuples, fix inference bug

# 0.0.1

Initial release

