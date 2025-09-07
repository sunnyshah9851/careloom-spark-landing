import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

type APISuggestion = {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string; // e.g., "Paris, Île-de-France, France"
};

export function CityInput({
  value,
  onChange,
  placeholder = "Search for a city...",
  className,
  id,
}: CityInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<APISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Small in-memory cache so we don’t refetch the same query repeatedly
  const cacheRef = useRef<Record<string, APISuggestion[]>>({});

  // Query Open-Meteo Geocoding API as the user types (debounced)
  useEffect(() => {
    const q = searchQuery?.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const key = q.toLowerCase();
    if (cacheRef.current[key]) {
      setSuggestions(cacheRef.current[key]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=10&language=en&format=json`;

        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();

        const results: APISuggestion[] = (json?.results ?? []).map((r: any) => ({
          id: String(r.id ?? `${r.name}-${r.latitude}-${r.longitude}`),
          name: r.name,
          admin1: r.admin1 ?? undefined,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
        }));

        cacheRef.current[key] = results;
        setSuggestions(results);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("City lookup failed:", e);
        }
      } finally {
        setLoading(false);
      }
    }, 250); // debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelect = (city: APISuggestion) => {
    onChange(city.displayName);
    setSearchQuery(city.displayName);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue);
    onChange(newValue);
    if (!open) setOpen(true);
  };

  const handleInputBlur = () => {
    // Allow free-text cities if it looks like a name
    if (searchQuery && searchQuery.match(/^[\p{L}\s\-'",.]+$/u)) {
      onChange(searchQuery);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          id={id}
        >
          {value || placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Type any city worldwide…"
            value={searchQuery}
            onValueChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <CommandList>
            {loading && <CommandEmpty>Searching…</CommandEmpty>}

            {!loading && suggestions.length === 0 && searchQuery.length >= 2 && (
              <CommandEmpty>
                {searchQuery.match(/^[\p{L}\s\-'",.]+$/u)
                  ? `Use "${searchQuery}" as your city`
                  : "Type a valid city name"}
              </CommandEmpty>
            )}

            {!loading && suggestions.length === 0 && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}

            {!loading && suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((city) => (
                  <CommandItem
  key={city.id}
  value={city.displayName}
  onSelect={() => handleSelect(city)}
>
  <Check
    className={cn(
      "mr-2 h-4 w-4",
      value === city.displayName ? "opacity-100" : "opacity-0"
    )}
  />
  {/* Only show the city name */}
  <span>{city.displayName}</span>
</CommandItem>

                ))}

                {/* Free-text option if the exact string isn’t in results */}
                {searchQuery &&
                  !suggestions.some(
                    (c) =>
                      c.displayName.toLowerCase() === searchQuery.toLowerCase()
                  ) &&
                  searchQuery.match(/^[\p{L}\s\-'",.]+$/u) && (
                    <CommandItem
                      value={searchQuery}
                      onSelect={() => {
                        onChange(searchQuery);
                        setOpen(false);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      <div>
                        <span>Use “{searchQuery}”</span>
                      </div>
                    </CommandItem>
                  )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
