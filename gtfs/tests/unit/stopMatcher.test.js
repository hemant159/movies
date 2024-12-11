const { findStopForPosition } = require('../../src/services/stopMatcher');
const Stop = require('../../src/models/Stop');

// Mock Stop model's findOne method
jest.mock('../../src/models/Stop', () => ({
  findOne: jest.fn()
}));

describe('findStopForPosition', () => {
  it('should return a stop if coordinates match', async () => {
    const mockStop = { _id: 'someStopId', stop_name: 'Test Stop' };
    Stop.findOne.mockResolvedValue(mockStop);

    const stop = await findStopForPosition(28.67524147, 77.16823577);
    expect(stop).toEqual(mockStop);
    expect(Stop.findOne).toHaveBeenCalledWith({
      stop_lat: "28.675241",
      stop_lon: "77.168236"
    });
  });

  it('should return null if no match is found', async () => {
    Stop.findOne.mockResolvedValue(null);
    const stop = await findStopForPosition(28.000000, 77.000000);
    expect(stop).toBeNull();
  });
});
