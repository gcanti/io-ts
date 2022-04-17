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
