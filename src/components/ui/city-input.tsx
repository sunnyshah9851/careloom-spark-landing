import * as React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface City {
  id: string
  name: string
  country: string
  region?: string
}

interface CityInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function CityInput({ value, onChange, placeholder = "Search for a city...", className, id }: CityInputProps) {
  const [open, setOpen] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)

  // Debounced search for cities
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCities([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        // Using a free city API - GeoDB Cities API (no auth required for basic usage)
        const response = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(searchQuery)}&limit=10&minPopulation=10000`,
          {
            headers: {
              'X-RapidAPI-Key': 'demo', // Using demo key for basic functionality
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          const cityResults = data.data?.map((city: any) => ({
            id: city.id.toString(),
            name: city.name,
            country: city.country,
            region: city.region
          })) || []
          setCities(cityResults)
        } else {
          // Fallback to a simple validation (check if it looks like a city name)
          if (searchQuery.match(/^[a-zA-Z\s\-']+$/)) {
            setCities([{
              id: 'custom',
              name: searchQuery,
              country: 'Unknown',
              region: undefined
            }])
          } else {
            setCities([])
          }
        }
      } catch (error) {
        // Fallback validation - allow if it looks like a valid city name
        if (searchQuery.match(/^[a-zA-Z\s\-']+$/)) {
          setCities([{
            id: 'custom',
            name: searchQuery,
            country: 'Unknown',
            region: undefined
          }])
        } else {
          setCities([])
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSelect = (city: City) => {
    const cityName = city.region ? `${city.name}, ${city.region}, ${city.country}` : `${city.name}, ${city.country}`
    onChange(cityName)
    setSearchQuery(cityName)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue)
    onChange(newValue)
    if (!open) setOpen(true)
  }

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
            placeholder="Type to search cities..."
            value={searchQuery}
            onValueChange={handleInputChange}
          />
          <CommandList>
            {loading && (
              <CommandEmpty>Searching cities...</CommandEmpty>
            )}
            {!loading && cities.length === 0 && searchQuery.length >= 2 && (
              <CommandEmpty>No cities found. Make sure to enter a valid city name.</CommandEmpty>
            )}
            {!loading && cities.length === 0 && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}
            {cities.length > 0 && (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.name}
                    onSelect={() => handleSelect(city)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === `${city.name}, ${city.country}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{city.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {city.region ? `${city.region}, ${city.country}` : city.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}