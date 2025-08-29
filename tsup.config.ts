import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'cli': 'src/cli.ts'
  },
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  external: ['commander', 'inquirer', 'chalk', 'ora'],
  noExternal: ['commander', 'inquirer', 'chalk', 'ora'],
  outDir: 'dist',
});
