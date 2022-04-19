Hi all, I've been working on a new version of the `Decoder` experimental module for a few months and I would like to show you my findings.  
  
This time I started from a bunch of use cases and long standing issues. 
  
The first two biggest changes are:  
  
- the error model 
- `These` instead of `Either` as decoding result  
  
therefore the `Decoder` signature has changed from: 
  
```ts 
export interface Decoder<I, A> {  
  readonly decode: (i: I) => Either<DecodeError, A> 
} 
``` 
  
to: 
  
```ts 
export interface Decoder<I, E, A> { 
  readonly decode: (i: I) => These<E, A>  
} 
``` 
  
which should unlock the possibility to: 
  
- customize the error types (rather than always being a string) (#578)  
- make `io-ts` more suitable for form decoding  
- return warnings other than errors (the `Both` member of `These`)  
- optionally fail on additional properties (#322) 
  
There are many other use cases I'm trying to solve but I want to start from this list to get early feedback from you all. 
  
You can find the source code in the `poc` branch: the `poc.ts` file contains all the relevant code so you can easily copy / paste and start playing.  
  
**customization of error types**  
  
Let's say we want to check the minimum length of a string:  
  
```ts 
// the model of the custom error  
export interface MinLengthE<N extends number> { 
  readonly _tag: 'MinLengthE' 
  readonly minLength: N 
  readonly actual: string 
} 
``` 
  
all custom errors must be wrapped in a `LeafE` error (a technical requirement): 
  
```ts 
export interface MinLengthLE<N extends number> extends LeafE<MinLengthE<N>> {}  
  
// constructor  
export const minLengthLE = <N extends number>(minLength: N, actual: string): MinLengthLE<N> =>  
  leafE({ _tag: 'MinLengthE', minLength, actual })  
``` 
  
now I can define my custom combinator:  
  
```ts 
export const minLength = <N extends number>(minLength: N): Decoder<string, MinLengthLE<N>, string> => ({  
  decode: (s) => (s.length >= minLength ? success(s) : failure(minLengthLE(minLength, s)))  
})  
  
const string3 = minLength(3)  
assert.deepStrictEqual(string3.decode('abc'), success('abc')) 
assert.deepStrictEqual(string3.decode('a'), failure(minLengthLE(3, 'a'))) 
``` 
  
**make `io-ts` more suitable for form decoding**  
  
Let's use `string3` in a `fromStruct`:  
  
```ts 
export const PersonForm = fromStruct({  
  name: string3,  
  age: number 
})  
/*  
const PersonForm: FromStructD<{ 
    name: Decoder<string, MinLengthLE<3>, string>;  
    age: numberUD;  
}>  
*/  
``` 
  
The decoding error is fully typed, this means that you can pattern match on the error:  
  
```ts 
export const formatPersonFormE = (de: ErrorOf<typeof PersonForm>): string =>  
  de.errors 
    .map((e): string => { 
      switch (e.key) {  
        case 'name':  
          //     this is of type `MinLengthE<3>` ---v 
          return `invalid name, must be ${e.error.error.minLength} or more characters long` 
        case 'age': 
          return 'invalid age'  
      } 
    })  
    .join(', ') 
  
assert.deepStrictEqual( 
  pipe(PersonForm.decode({ name: 'name', age: 18 }), TH.mapLeft(formatPersonFormE)),  
  success({ name: 'name', age: 18 })  
) 
assert.deepStrictEqual( 
  pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(formatPersonFormE)),  
  failure('invalid name, must be 3 or more characters long')  
) 
assert.deepStrictEqual( 
  pipe(PersonForm.decode({ name: '', age: null }), TH.mapLeft(formatPersonFormE)),  
  failure('invalid name, must be 3 or more characters long, invalid age') 
) 
``` 
  
**return warnings other than errors** 
  
The `number` decoder can raise a `NumberE` error but also two warnings: 
  
- `NaNE`  
- `InfinityE` 
  
```ts 
export const formatNumberE = (de: ErrorOf<typeof number>): string => {  
  switch (de.error._tag) {  
    case 'NumberE': 
      return 'the input is not even a number' 
    case 'NaNE':  
      return 'the input is NaN' 
    case 'InfinityE': 
      return 'the input is Infinity'  
  } 
} 
  
assert.deepStrictEqual(pipe(number.decode(1), TH.mapLeft(formatNumberE)), success(1)) 
assert.deepStrictEqual(pipe(number.decode(null), TH.mapLeft(formatNumberE)), failure('the input is not even a number')) 
assert.deepStrictEqual(pipe(number.decode(NaN), TH.mapLeft(formatNumberE)), warning('the input is NaN', NaN)) 
``` 
  
**optionally fail on additional properties**  
  
Additional properties are still stripped out, but they are also reported as warnings: 
  
```ts 
export const A = struct({ a: string })  
  
assert.deepStrictEqual( 
  //                                   v-- this utility transforms a decoding error into a tree 
  pipe(A.decode({ a: 'a', c: true }), draw),  
  warning('1 error(s) found while checking keys\
└─ unexpected key \"c\"', { a: 'a' }) 
  // warning ---^                                                             ^-- stripped out result 
) 
``` 
  
Then you can choose to \"absolve\" the `Both` result to a `Right` or \"condemn\" to a `Left`. 
  
Since additional properties are reported as warnings rather than errors, this mechanism play well with intersections too. 
I wrote an algorithm based on the following statement: a property is considered additional if is additional for each member of the intersection.  
  
```ts 
export const B = struct({ b: number })  
export const AB = pipe(A, intersect(B)) 
  
assert.deepStrictEqual( 
  pipe(AB.decode({ a: 'a', b: 1, c: true }), draw), 
  warning(  
    `2 error(s) found while decoding (intersection) 
├─ 1 error(s) found while decoding member 0 
│  └─ 1 error(s) found while checking keys  
│     └─ unexpected key \"c\" 
└─ 1 error(s) found while decoding member 1 
   └─ 1 error(s) found while checking keys  
      └─ unexpected key \"c\"`, 
    { a: 'a', b: 1 }  
  ) 
) 
``` 
  
^ here only the `\"c\"` property is reported as additional  

> all custom errors must be wrapped in a `LeafE` error (a technical requirement)  
  
Why is that? Because the error type in `Decoder` is now generic (`E`), which means that on one hand we get a fully typed error (see the comment above about form handling) but on the other hand it poses a new problem: how to handle errors in a generic way? For example, how to define a `toTree` utility that transforms **any** decoding error into a `Tree<string>`? 
  
A possible solution is to define a sum type representing all errors:  
  
```ts 
// I can pattern match on `DecodeError` while retaining the possibility to define custom errors 
export type DecodeError<E> =  
  | UnexpectedKeysE 
  | MissingKeysE  
  | UnexpectedIndexesE  
  | MissingIndexesE 
  | LeafE<E> // <= leaf error 
  | NullableE<E>  
  | etc...  
``` 
  
where `LeafE` represents a \"leaf error\" and can contain custom errors too.  
  
When I try to define a `toTree` function: 
  
```ts 
declare const toTree: <E>(de: DecodeError<E>) => Tree<string> 
``` 
  
I also need a way to transform a generic `E` to `Tree<string>` so I define `toTreeWith` instead:  
  
```ts 
export declare const toTreeWith: <E>(toTree: (e: E) => Tree<string>) => (de: DecodeError<E>) => Tree<string>  
``` 
  
Now I can define `toTree` as  
  
```ts 
const toTree = toTreeWith(toTreeBuiltin)  
``` 
  
where `toTreeBuiltin: (de: BuiltinE) => Tree<string>` is an helper able to serialize the built-in errors. 
  
But what if the decoding error contains a custom error? Fortunately the whole mechanism is type safe and I get a typescript error:  
  
```ts 
pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(toTree)) // Type 'MinLengthLE<3>' is not assignable to type 'LeafE<BuiltinE>' 
``` 
  
As a fix I can define my custom `toTree` function 
  
```ts 
//                                    my custom error --v 
export const myToTree = toTreeWith((e: BuiltinE | MinLengthE<number>) => {  
  switch (e._tag) { 
    case 'MinLengthE':  
      return tree(`cannot decode ${format(e.actual)}, must be ${e.minLength} or more characters long`)  
    default:  
      return toTreeBuiltin(e) 
  } 
})  
  
assert.deepStrictEqual( 
  pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(myToTree)), 
  failure(  
    tree('1 error(s) found while decoding (struct)', [  
      tree('1 error(s) found while decoding required key \"name\"', [ 
        tree('cannot decode \"\", must be 3 or more characters long') 
      ])  
    ])  
  ) 
) 
``` 
  
A notable decoding error is `MessageE` which allows to express a custom error message:  
  
**use case: old decoder, custom error message** 
  
```ts 
// throw away utiliy for this issue 
export const toString = flow(draw, print) 
  
export const mystring = pipe( 
  string, 
  mapLeft(() => message(`please insert a string`))  
) 
  
assert.deepStrictEqual( 
  pipe(string.decode(null), toString),  
  `Errors:  
cannot decode null, expected a string` // <= default message  
) 
assert.deepStrictEqual( 
  pipe(mystring.decode(null), toString),  
  `Errors:  
please insert a string` // <= custom message  
) 
``` 
  
**use case: new decoder, custom error message** 
  
The `message` constructor can be used with new decoders too:  
  
```ts 
export const date: Decoder<unknown, MessageLE, Date> = {  
  decode: (u) => (u instanceof Date ? success(u) : failure(message('not a Date')))  
} 
  
assert.deepStrictEqual( 
  pipe(date.decode(null), toString),  
  `Errors:  
not a Date` 
) 
``` 
  
**use case: new decoder, multiple custom messages** (#487)  
  
```ts 
export interface UsernameBrand {  
  readonly Username: unique symbol  
} 
  
export type Username = string & UsernameBrand 
  
const USERNAME_REGEX = /(a|b)*d/  
  
export const Username = pipe( 
  mystring, 
  compose({ 
    decode: (s) =>  
      s.length < 2  
        ? failure(message('too short')) 
        : s.length > 4  
        ? failure(message('too long'))  
        : USERNAME_REGEX.test(s)  
        ? failure(message('bad characters'))  
        : success(s as Username)  
  })  
) 
  
assert.deepStrictEqual( 
  pipe(tuple(Username, Username, Username, Username, Username).decode([null, 'a', 'bbbbb', 'abd', 'ok']), toString),  
  `Errors:  
4 error(s) found while decoding (tuple) 
├─ 1 error(s) found while decoding required component 0 
│  └─ please insert a string  
├─ 1 error(s) found while decoding required component 1 
│  └─ too short 
├─ 1 error(s) found while decoding required component 2 
│  └─ too long  
└─ 1 error(s) found while decoding required component 3 
   └─ bad characters` 
) 
``` 
