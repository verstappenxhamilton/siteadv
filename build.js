const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const outputs = [
  { entry: path.resolve('src/main.jsx'), outfile: path.resolve('public/assets/index.js') },
  { entry: path.resolve('src/chat.jsx'), outfile: path.resolve('public/assets/chat.js') },
];

const sharedConfig = {
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2017'],
  jsx: 'automatic',
  sourcemap: false,
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

async function build() {
  await Promise.all(
    outputs.map(async ({ entry, outfile }) => {
      await fs.promises.mkdir(path.dirname(outfile), { recursive: true });
      return esbuild.build({
        ...sharedConfig,
        entryPoints: [entry],
        outfile,
      });
    }),
  );
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
