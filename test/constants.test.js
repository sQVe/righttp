import { defaultContainer } from '../src/constants'

describe('constants', () => {
  beforeEach(() => {
    global.JSON = {
      stringify: jest.fn(),
    }
  })

  afterEach(jest.clearAllMocks)

  it('should have the correct default settings', () => {
    const payload = 'JSON'
    defaultContainer.options.payloadAs(payload)

    expect(defaultContainer).toMatchSnapshot()
    expect(JSON.stringify).toHaveBeenCalledTimes(1)
    expect(JSON.stringify).toHaveBeenCalledWith(payload)
  })
})
