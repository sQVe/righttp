import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const env = process.env.NODE_ENV

const defaults = {
  input: 'src/index.js',
  output: { exports: 'named', format: env, indent: false },
  plugins: [nodeResolve ({ jsnext: true }), commonjs (), json ()],
  treeshake: true,
}
const dependencies = [...Object.keys (pkg.dependencies || {}), 'core-js']
const external = id => dependencies.map (dep => id.startsWith (dep)).some (Boolean)

export default (() =>
  env === 'cjs'
    ? [
        {
          ...defaults,
          external,
          output: { ...defaults.output, file: `lib/${pkg.name}.js` },
          plugins: [...defaults.plugins, babel ({ runtimeHelpers: true })],
        },
      ]
    : env === 'es'
    ? [
        {
          ...defaults,
          external,
          output: { ...defaults.output, file: `es/${pkg.name}.js` },
          plugins: [...defaults.plugins, babel ({ runtimeHelpers: true })],
        },
        {
          ...defaults,
          output: { ...defaults.output, file: `es/${pkg.name}.mjs` },
          plugins: [
            ...defaults.plugins,
            terser ({
              compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false,
              },
            }),
          ],
        },
      ]
    : env === 'umd'
    ? [
        {
          ...defaults,
          output: {
            ...defaults.output,
            file: `dist/${pkg.name}.js`,
            name: pkg.name,
          },
          plugins: [...defaults.plugins, babel ({ exclude: 'node_modules/**' })],
        },
        {
          ...defaults,
          output: {
            ...defaults.output,
            file: `dist/${pkg.name}.min.js`,
            name: pkg.name,
          },
          plugins: [
            ...defaults.plugins,
            babel ({ exclude: 'node_modules/**' }),
            terser ({
              compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false,
              },
            }),
          ],
        },
      ]
    : []) ()
