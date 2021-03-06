import * as path from 'path'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as A from 'fp-ts/lib/ReadonlyArray'
import * as TE from 'fp-ts/lib/TaskEither'
import { FileSystem, fileSystem } from './FileSystem'
import { run } from './run'

interface Build<A> extends RTE.ReaderTaskEither<FileSystem, Error, A> {}

const OUTPUT_FOLDER = 'dist'
const PKG = 'package.json'

export const copyPackageJson: Build<void> = (C) =>
  pipe(
    C.readFile(PKG),
    TE.chain((s) => TE.fromEither(E.parseJSON(s, E.toError))),
    TE.map((v) => {
      const clone = Object.assign({}, v as any)

      delete clone.scripts
      delete clone.files
      delete clone.devDependencies

      return clone
    }),
    TE.chain((json) => C.writeFile(path.join(OUTPUT_FOLDER, PKG), JSON.stringify(json, null, 2)))
  )

export const FILES: ReadonlyArray<string> = ['CHANGELOG.md', 'LICENSE', 'README.md']

export const copyFiles: Build<ReadonlyArray<void>> = (C) =>
  A.readonlyArray.traverse(TE.taskEither)(FILES, (from) => C.copyFile(from, path.resolve(OUTPUT_FOLDER, from)))

const traverse = A.readonlyArray.traverse(TE.taskEither)

export const makeModules: Build<void> = (C) =>
  pipe(
    C.glob(`${OUTPUT_FOLDER}/lib/*.js`),
    TE.map(getModules),
    TE.chain((modules) => traverse(modules, makeSingleModule(C))),
    TE.map(() => undefined)
  )

function getModules(paths: ReadonlyArray<string>): ReadonlyArray<string> {
  return paths.map((filePath) => path.basename(filePath, '.js')).filter((x) => x !== 'index')
}

function makeSingleModule(C: FileSystem): (module: string) => TE.TaskEither<Error, void> {
  return (m) =>
    pipe(
      C.mkdir(path.join(OUTPUT_FOLDER, m)),
      TE.chain(() => makePkgJson(m)),
      TE.chain((data) => C.writeFile(path.join(OUTPUT_FOLDER, m, 'package.json'), data))
    )
}

function makePkgJson(module: string): TE.TaskEither<Error, string> {
  return pipe(
    JSON.stringify(
      {
        main: `../lib/${module}.js`,
        module: `../es6/${module}.js`,
        typings: `../lib/${module}.d.ts`,
        sideEffects: false
      },
      null,
      2
    ),
    TE.right
  )
}

const main: Build<void> = pipe(
  copyPackageJson,
  RTE.chain(() => copyFiles),
  RTE.chain(() => makeModules)
)

run(
  main({
    ...fileSystem
  })
)
