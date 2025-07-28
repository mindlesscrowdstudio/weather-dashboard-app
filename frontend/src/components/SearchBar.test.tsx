import { render, screen, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import { describe, test, expect, beforeEach, vi } from "vitest"
import { SearchBar } from '@/components/SearchBar';

describe("SearchBar", () => {
  const mockSetSearchTerm = vi.fn()
  const mockHandleSearch = vi.fn((e) => e.preventDefault())

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("should render an input and a search button", () => {
    render(<SearchBar searchTerm="" setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} />)
    expect(screen.getByLabelText(/search for a city/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument()
  })

  test("should disable the search button when the input is empty", () => {
    render(<SearchBar searchTerm=" " setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} />)
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled()
  })

  test("should enable the search button when the input has text", () => {
    render(<SearchBar searchTerm="London" setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} />)
    expect(screen.getByRole("button", { name: /search/i })).toBeEnabled()
  })

  test("should call setSearchTerm on input change", () => {
    render(<SearchBar searchTerm="" setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} />)
    const input = screen.getByLabelText(/search for a city/i)
    fireEvent.change(input, { target: { value: "Paris" } })
    expect(mockSetSearchTerm).toHaveBeenCalledWith("Paris")
  })

  test("should call handleSearch on form submission", () => {
    render(<SearchBar searchTerm="London" setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} />)
    const form = screen.getByRole("form", { name: /city search form/i })
    fireEvent.submit(form)
    expect(mockHandleSearch).toHaveBeenCalledTimes(1)
  })

  test("should show loading state when loading prop is true", () => {
    render(<SearchBar searchTerm="London" setSearchTerm={mockSetSearchTerm} handleSearch={mockHandleSearch} loading={true} />)

    // When loading, the button text changes, so we find it by its new text.
    const searchButton = screen.getByRole("button", { name: /searching/i })

    // Check that the button is disabled and displays the correct loading text.
    expect(searchButton).toBeDisabled()
    expect(searchButton).toHaveTextContent("Searching...")
  })
})
