import { render, screen, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  const mockSetSearchTerm = vi.fn();
 // const mockHandleSearch = vi.fn(e) => e.preventDefault();

 

  it('should render an input and a search button', () => {
    render(
      <SearchBar
        searchTerm=""
        setSearchTerm={vi.fn()}
        handleSearch={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
});
