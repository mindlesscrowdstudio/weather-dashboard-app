/* "use client";

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchBarProps } from "@/types";


export function SearchBar({ searchTerm, setSearchTerm, handleSearch, loading }: SearchBarProps) {
  return (
    <form role="form" onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder="Search city..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow bg-white border-gray-200 focus:border-blue-500"
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={!searchTerm.trim() || loading}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6"
      >
        Search
      </Button>
    </form>
  )
}
 */