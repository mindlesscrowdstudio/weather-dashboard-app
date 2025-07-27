
//import type React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SearchBarProps } from "@/types"


export function SearchBar({ searchTerm, setSearchTerm, handleSearch, loading }: SearchBarProps) {
  return (
    <form role="form" onSubmit={handleSearch} className="flex gap-2 mb-8">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 h-12 text-base bg-white border border-gray-200 rounded-lg"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <Button
        type="submit"
        disabled={!searchTerm.trim() || loading}
        className="px-6 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
    
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
