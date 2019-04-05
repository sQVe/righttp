import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const bundleTarget = process.env.BUILD_BUNDLE
const dependencies = [
  ...Object.keys (pkg.dependencies || {}),
  ...Object.keys (pkg.peerDependencies || {}),
  'core-js',
]
const isNil = (...xs) => xs.some (x => x == null)
const isObjectLike = x => x != null && typeof x === 'object'
const isArrayLike = x => x != null && typeof x[Symbol.iterator] === 'function'
const isSameType = (x, y) => !isNil (x, y) && x.constructor === y.constructor
const external = id => dependencies.map (dep => id.startsWith (dep)).some (Boolean)
const sanitizeBundle = ({ type, ...rest }) => rest

const defaults = {
  input: 'src/index.js',
  output: { exports: 'named', indent: false },
  plugins: [nodeResolve ({ jsnext: true }), commonjs (), json ()],
  treeshake: true,
}

const bundle = opts =>
  Object.entries ({ ...defaults, ...opts }).reduce (
    (acc, [k, v]) => ({
      ...acc,
      [k]:
        isObjectLike (v) && isSameType (v, defaults[k])
          ? isArrayLike (v)
            ? [...defaults[k], ...v]
            : { ...defaults[k], ...v }
          : v,
    }),
    {}
  )

const bundles = [
  bundle ({
    external,
    output: { format: 'cjs', file: `lib/${pkg.name}.js` },
    plugins: [babel ({ runtimeHelpers: true })],
    type: 'cjs',
  }),
  bundle ({
    external,
    output: { format: 'es', file: `es/${pkg.name}.mjs` },
    plugins: [babel ({ runtimeHelpers: true })],
    type: 'es',
  }),
  bundle ({
    output: { format: 'umd', file: `dist/${pkg.name}.js`, name: pkg.name },
    plugins: [babel ({ exclude: 'node_modules/**' })],
    type: 'umd',
  }),
  bundle ({
    output: { format: 'umd', file: `dist/${pkg.name}.min.js`, name: pkg.name },
    plugins: [
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
    type: 'umd',
  }),
]

export default (() =>
  [
    ...(bundleTarget != null
      ? bundles.filter (x => x.type === bundleTarget)
      : bundles),
  ].map (sanitizeBundle)) ()
