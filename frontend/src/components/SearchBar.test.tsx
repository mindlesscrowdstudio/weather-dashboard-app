import { render, screen, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import { describe, test, expect, beforeEach, vi } from "vitest"
import { SearchBar } from '@/components/SearchBar';
import type { SearchBarProps } from '@/types';

const setup = (props: Partial<SearchBarProps> = {}) => {
  const defaultProps: SearchBarProps = {
    searchTerm: 'London',
    setSearchTerm: vi.fn(),
    handleSearch: vi.fn((e) => e.preventDefault()),
    loading: false,
  };
  const view = render(<SearchBar {...defaultProps} {...props} />);
  return { ...view, props: { ...defaultProps, ...props } };
};

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test("should render an input and a search button", () => {
      setup({ searchTerm: '' });
      expect(screen.getByLabelText(/search for a city/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    test("should disable the search button when the input is empty or whitespace", () => {
      setup({ searchTerm: '   ' });
      expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
    });

    test("should enable the search button when the input has text", () => {
      setup();
      expect(screen.getByRole("button", { name: /search/i })).toBeEnabled();
    });
  });

  describe('User Interaction', () => {
    test("should call setSearchTerm on input change", () => {
      const { props } = setup({ searchTerm: '' });
      const input = screen.getByLabelText(/search for a city/i);
      fireEvent.change(input, { target: { value: "Paris" } });
      expect(props.setSearchTerm).toHaveBeenCalledWith("Paris");
    });

    test("should call handleSearch when the search button is clicked", () => {
      const { props } = setup();
      const button = screen.getByRole("button", { name: /search/i });
      fireEvent.click(button);
      expect(props.handleSearch).toHaveBeenCalledTimes(1);
    });

    test("should call handleSearch when Enter is pressed in the input", () => {
      const { props } = setup();
      const input = screen.getByLabelText(/search for a city/i);
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      // Note: Pressing Enter on an input inside a form triggers the form's submit event.
      expect(props.handleSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    test("should show loading state when loading prop is true", () => {
      setup({ loading: true });
      const searchButton = screen.getByRole("button", { name: /searching/i });
      expect(searchButton).toBeDisabled();
      expect(searchButton).toHaveTextContent("Searching...");
    });
  });
});
