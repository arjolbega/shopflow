import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

interface SearchOverlayProps {
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const SearchOverlay = React.memo(({ setIsSearchOpen, searchRef }: SearchOverlayProps) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
      <div className="max-w-2xl mx-auto mt-24 px-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSearch} className={cn("flex items-center gap-3", "bg-bg-elevated border border-border", "rounded-2xl px-5 py-4", "shadow-2xl", "animate-in fade-in zoom-in-95 duration-200")}>
          <Search size={20} className="text-text-muted flex-shrink-0" />
          <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className={cn("flex-1 bg-transparent", "text-text-primary placeholder:text-text-muted", "text-lg outline-none")} />
          <button type="button" onClick={() => setIsSearchOpen(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </form>
        <p className="text-center text-text-muted text-sm mt-3">
          Press <kbd className="px-2 py-0.5 bg-bg-elevated border border-border rounded text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
});

export default SearchOverlay;
