import { fetchMock } from 'fetch-mock'

import { items } from './db.json'

function createDbEndpoints() {
  fetchMock.mock('api/items/', items, { method: 'GET' })
  fetchMock.mock('api/items/', items[0], { method: 'POST' })

  items.forEach((x, i) => {
    fetchMock.mock(`api/items/${i}/`, x, { method: 'GET' })
    fetchMock.mock(
      `api/items/${i}/`,
      { ...x, changed: true },
      { method: 'PUT' }
    )
    fetchMock.mock(`api/items/${i}/`, 200, { method: 'DELETE' })
  })
}

function createStatusEndpoints() {
  ;[200, 404].forEach(x => fetchMock.mock(`api/${x}/`, x))
}

export function createApi() {
  createDbEndpoints()
  createStatusEndpoints()
}

export const resetApi = fetchMock.reset
export const resetApiHistory = fetchMock.resetHistory
