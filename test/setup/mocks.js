export const fooContainer = {
  url: 'foo',
  init: { foo: true },
  options: { foo: true },
}

export const barContainer = {
  url: 'bar',
  init: { foo: false, bar: true },
  options: { foo: false, bar: true },
}

// Excluding FormData due to lack of support in node-fetch and Response as it
// always returns a Response when successful, ie. any Response would work as a
// mock.
export const resolveAsResponses = {
  ArrayBuffer: Buffer.from('arrayBuffer'),
  Blob: new Blob(['blob'], { type: 'plain/text' }),
  JSON: JSON.stringify(['json']),
  Text: 'text',
}
