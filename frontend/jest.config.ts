import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
  displayName: {
    name: "Web Frontend",
    color: "magentaBright"
  },
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  },
  roots: [
    "<rootDir>/pages"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
});