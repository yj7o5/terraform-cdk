import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'bin/cdktf.ts',
  output: {
    dir: 'output',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    nodePolyfills(),
      resolve(),
    
    typescript({module: 'esnext', moduleResolution: 'node', rootDir: '.', declaration: false})],
};