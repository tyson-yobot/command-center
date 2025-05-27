import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search conversations, leads, or clients..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 search-input"
      />
    </div>
  );
}
