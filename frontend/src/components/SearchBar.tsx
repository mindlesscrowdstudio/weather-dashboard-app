
//import type React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SearchBarProps } from "@/types"


export function SearchBar({ searchTerm, setSearchTerm, handleSearch, loading }: SearchBarProps) {
  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-8" aria-label="City search form">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search city..."
          aria-label="Search for a city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 h-12 text-base bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder:text-gray-200 focus:ring-white"
        />
        {/* This icon is decorative, so we hide it from screen readers */}
        <Search aria-hidden="true" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-200" />
      </div>
      <Button
        type="submit"
        disabled={!searchTerm.trim() || loading}
        className="px-6 h-12 bg-white/30 hover:bg-white/40 text-white rounded-2xl w-32 justify-center transition-colors"
      >
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
