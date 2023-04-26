/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['./test/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      './test/**/util.ts',
      './test/JsonSchema.ts',
      './test/helpers.ts',
      './test/Arbitrary.ts',
      './test/2.1.x/helpers.ts'
    ],
    globals: true,
    coverage: {
      provider: 'istanbul'
    }
  }
})
