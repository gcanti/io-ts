module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/Schemable2.ts', '!src/poc.ts', '!src/Codec2.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: 'test',
  moduleFileExtensions: ['ts', 'js'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  modulePathIgnorePatterns: [
    '2.1.x/helpers.ts',
    'Arbitrary.ts',
    'Arbitrary2.ts',
    'helpers.ts',
    'JsonSchema.ts',
    'util.ts'
  ]
}
