import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const env = process.env.NODE_ENV

const defaults = { input: 'src/index.js', treeshake: true, plugins: [json ()] }
const dependencies = [...Object.keys (pkg.dependencies || {}), 'core-js']
const external = id => dependencies.map (dep => id.startsWith (dep)).some (Boolean)

export default (() =>
  env === 'cjs'
    ? [
        {
          ...defaults,
          external,
          output: { file: `lib/${pkg.name}.js`, format: 'cjs', indent: false },
          plugins: [...defaults.plugins, babel ({ runtimeHelpers: true })],
        },
      ]
    : env === 'es'
    ? [
        {
          ...defaults,
          external,
          output: { file: `es/${pkg.name}.js`, format: 'es', indent: false },
          plugins: [...defaults.plugins, babel ({ runtimeHelpers: true })],
        },
        {
          ...defaults,
          output: { file: `es/${pkg.name}.mjs`, format: 'es', indent: false },
          plugins: [
            ...defaults.plugins,
            commonjs (),
            nodeResolve ({ jsnext: true }),
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
            file: `dist/${pkg.name}.js`,
            format: 'umd',
            name: pkg.name,
            indent: false,
          },
          plugins: [
            ...defaults.plugins,
            babel ({ exclude: 'node_modules/**' }),
            commonjs (),
            nodeResolve ({ jsnext: true }),
          ],
        },
        {
          ...defaults,
          output: {
            file: `dist/${pkg.name}.min.js`,
            format: 'umd',
            name: pkg.name,
            indent: false,
          },
          plugins: [
            ...defaults.plugins,
            babel ({ exclude: 'node_modules/**' }),
            commonjs (),
            nodeResolve ({ jsnext: true }),
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
