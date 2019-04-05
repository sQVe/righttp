const { NODE_ENV } = process.env

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        modules: NODE_ENV === 'test' ? 'auto' : false,
        targets: {
          browsers: ['ie >= 11'],
          node: 8,
        },
        useBuiltIns: 'usage',
      },
    ],
  ],
  plugins: ['es', 'cjs', 'test'].includes(NODE_ENV)
    ? ['@babel/transform-runtime']
    : [],
}
