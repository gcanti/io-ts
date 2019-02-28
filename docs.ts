import { main } from 'docs-ts'

const pkg = require('./package.json')

const srcDir = 'src/**/*.ts'
const outDir = 'docs'
const doTypeCheckExamples = true
main(srcDir, outDir, doTypeCheckExamples, pkg.name).run()
