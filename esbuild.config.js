const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: true,
    minify: false,
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
    },
  })
  .catch(() => process.exit(1))
