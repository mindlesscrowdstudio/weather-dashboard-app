import { handleAPIError } from '../src/services/weatherService';
import axios from 'axios';

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('handleAPIError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle Axios errors with a response', () => {
    // Mock axios.isAxiosError to return true
    mockedAxios.isAxiosError.mockReturnValue(true);

    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { message: 'City not found' },
      },
    };

    const result = handleAPIError(mockAxiosError as any);
    expect(result).toEqual({ status: 404, message: "City not found" });
    expect(mockedAxios.isAxiosError).toHaveBeenCalledWith(mockAxiosError);
  });

  it("should handle Axios errors without a custom message", () => {
    mockedAxios.isAxiosError.mockReturnValue(true)

    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 500,
        data: {}, // No message in data
      },
    }

    const result = handleAPIError(mockAxiosError as any)

    expect(result).toEqual({
      status: 500,
      message: "API error with status 500",
    });

  });

  it("should handle Axios errors without a response", () => {
    mockedAxios.isAxiosError.mockReturnValue(true)

    const mockAxiosError = {
      isAxiosError: true,
      // No response property (network error)
    }
    const result = handleAPIError(mockAxiosError as any)

    // Should fall to the "unknown error" case
    expect(result).toEqual({
      status: 500,
      message: "An unexpected error occurred",
    });
  })

  it('should handle generic JavaScript errors', () => {
    mockedAxios.isAxiosError.mockReturnValue(true);

    const mockError = new Error('Something went wrong');
    const result = handleAPIError(mockError);

    expect(result).toEqual({
      status: 500, 
      message: 'Something went wrong' 
    }); 
  });

  it('should handle unknown errors', () => {
    mockedAxios.isAxiosError.mockReturnValue(false);
    const mockUnknownError = 'Unknown error';
    const result = handleAPIError(mockUnknownError as any);

    expect(result).toEqual({ status: 500, message: 'An unexpected error occurred' });
  });

  it("should handle null or undefined errors", () => {
    mockedAxios.isAxiosError.mockReturnValue(false)

    const result1 = handleAPIError(null)
    const result2 = handleAPIError(undefined)

    expect(result1).toEqual({
      status: 500,
      message: "An unexpected error occurred",
    })
    expect(result2).toEqual({
      status: 500,
      message: "An unexpected error occurred",
    })
  });
});