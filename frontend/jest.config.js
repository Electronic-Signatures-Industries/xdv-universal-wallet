module.exports = {
  displayName: {
    name: "Frontend",
    color: "magentaBright"
  },
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  },
  roots: [
    "<rootDir>"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFilesAfterEnv: [
    "./jest.setup.js"
  ],
  globals: {
    'ts-jest': {
      "tsconfig": "./tsconfig.jest.json"
    }
  }
};