module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/output/', '/tspackage/'],
  globals: {
    skipBabel: true,
  },
}
