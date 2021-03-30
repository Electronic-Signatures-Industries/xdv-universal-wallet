import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
  displayName: {
    name: "Core Module",
    color: 'blueBright'
  },
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
});