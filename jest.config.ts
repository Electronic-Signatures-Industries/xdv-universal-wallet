import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
  projects: [
    "<rootDir>/core",
    "<rootDir>/frontend"
  ]
});