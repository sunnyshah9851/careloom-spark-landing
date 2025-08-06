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
  state: string
  displayName: string
}

interface CityInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

// Top US cities by population - this ensures we have good coverage
const US_CITIES: City[] = [
  { id: "1", name: "New York", state: "NY", displayName: "New York, NY" },
  { id: "2", name: "Los Angeles", state: "CA", displayName: "Los Angeles, CA" },
  { id: "3", name: "Chicago", state: "IL", displayName: "Chicago, IL" },
  { id: "4", name: "Houston", state: "TX", displayName: "Houston, TX" },
  { id: "5", name: "Phoenix", state: "AZ", displayName: "Phoenix, AZ" },
  { id: "6", name: "Philadelphia", state: "PA", displayName: "Philadelphia, PA" },
  { id: "7", name: "San Antonio", state: "TX", displayName: "San Antonio, TX" },
  { id: "8", name: "San Diego", state: "CA", displayName: "San Diego, CA" },
  { id: "9", name: "Dallas", state: "TX", displayName: "Dallas, TX" },
  { id: "10", name: "San Jose", state: "CA", displayName: "San Jose, CA" },
  { id: "11", name: "Austin", state: "TX", displayName: "Austin, TX" },
  { id: "12", name: "Jacksonville", state: "FL", displayName: "Jacksonville, FL" },
  { id: "13", name: "Fort Worth", state: "TX", displayName: "Fort Worth, TX" },
  { id: "14", name: "Columbus", state: "OH", displayName: "Columbus, OH" },
  { id: "15", name: "Charlotte", state: "NC", displayName: "Charlotte, NC" },
  { id: "16", name: "San Francisco", state: "CA", displayName: "San Francisco, CA" },
  { id: "17", name: "Indianapolis", state: "IN", displayName: "Indianapolis, IN" },
  { id: "18", name: "Seattle", state: "WA", displayName: "Seattle, WA" },
  { id: "19", name: "Denver", state: "CO", displayName: "Denver, CO" },
  { id: "20", name: "Washington", state: "DC", displayName: "Washington, DC" },
  { id: "21", name: "Boston", state: "MA", displayName: "Boston, MA" },
  { id: "22", name: "El Paso", state: "TX", displayName: "El Paso, TX" },
  { id: "23", name: "Nashville", state: "TN", displayName: "Nashville, TN" },
  { id: "24", name: "Detroit", state: "MI", displayName: "Detroit, MI" },
  { id: "25", name: "Oklahoma City", state: "OK", displayName: "Oklahoma City, OK" },
  { id: "26", name: "Portland", state: "OR", displayName: "Portland, OR" },
  { id: "27", name: "Las Vegas", state: "NV", displayName: "Las Vegas, NV" },
  { id: "28", name: "Memphis", state: "TN", displayName: "Memphis, TN" },
  { id: "29", name: "Louisville", state: "KY", displayName: "Louisville, KY" },
  { id: "30", name: "Baltimore", state: "MD", displayName: "Baltimore, MD" },
  { id: "31", name: "Milwaukee", state: "WI", displayName: "Milwaukee, WI" },
  { id: "32", name: "Albuquerque", state: "NM", displayName: "Albuquerque, NM" },
  { id: "33", name: "Tucson", state: "AZ", displayName: "Tucson, AZ" },
  { id: "34", name: "Fresno", state: "CA", displayName: "Fresno, CA" },
  { id: "35", name: "Sacramento", state: "CA", displayName: "Sacramento, CA" },
  { id: "36", name: "Mesa", state: "AZ", displayName: "Mesa, AZ" },
  { id: "37", name: "Kansas City", state: "MO", displayName: "Kansas City, MO" },
  { id: "38", name: "Atlanta", state: "GA", displayName: "Atlanta, GA" },
  { id: "39", name: "Long Beach", state: "CA", displayName: "Long Beach, CA" },
  { id: "40", name: "Colorado Springs", state: "CO", displayName: "Colorado Springs, CO" },
  { id: "41", name: "Raleigh", state: "NC", displayName: "Raleigh, NC" },
  { id: "42", name: "Miami", state: "FL", displayName: "Miami, FL" },
  { id: "43", name: "Virginia Beach", state: "VA", displayName: "Virginia Beach, VA" },
  { id: "44", name: "Omaha", state: "NE", displayName: "Omaha, NE" },
  { id: "45", name: "Oakland", state: "CA", displayName: "Oakland, CA" },
  { id: "46", name: "Minneapolis", state: "MN", displayName: "Minneapolis, MN" },
  { id: "47", name: "Tulsa", state: "OK", displayName: "Tulsa, OK" },
  { id: "48", name: "Tampa", state: "FL", displayName: "Tampa, FL" },
  { id: "49", name: "Arlington", state: "TX", displayName: "Arlington, TX" },
  { id: "50", name: "New Orleans", state: "LA", displayName: "New Orleans, LA" }
]

export function CityInput({ value, onChange, placeholder = "Search for a city...", className, id }: CityInputProps) {
  const [open, setOpen] = useState(false)
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [searchQuery, setSearchQuery] = useState(value)

  // Filter cities based on search query
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setFilteredCities([])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = US_CITIES.filter(city => 
      city.name.toLowerCase().includes(query) || 
      city.state.toLowerCase().includes(query) ||
      city.displayName.toLowerCase().includes(query)
    ).slice(0, 10) // Limit to 10 results

    setFilteredCities(filtered)
  }, [searchQuery])

  const handleSelect = (city: City) => {
    onChange(city.displayName)
    setSearchQuery(city.displayName)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue)
    onChange(newValue)
    if (!open) setOpen(true)
  }

  const handleInputBlur = () => {
    // Allow any city name that looks valid (letters, spaces, hyphens, apostrophes)
    if (searchQuery && searchQuery.match(/^[a-zA-Z\s\-'.,]+$/)) {
      onChange(searchQuery)
    }
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
            placeholder="Type to search US cities or enter any city worldwide..."
            value={searchQuery}
            onValueChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <CommandList>
            {filteredCities.length === 0 && searchQuery.length >= 2 && (
              <CommandEmpty>
                {searchQuery.match(/^[a-zA-Z\s\-'.,]+$/) 
                  ? `Use "${searchQuery}" as your city (any city worldwide)` 
                  : "Type a valid city name"
                }
              </CommandEmpty>
            )}
            {filteredCities.length === 0 && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}
            {filteredCities.length > 0 && (
              <CommandGroup>
                {filteredCities.map((city) => (
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
                    <div className="flex flex-col">
                      <span>{city.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {city.state}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {searchQuery && !filteredCities.some(city => 
                  city.displayName.toLowerCase() === searchQuery.toLowerCase()
                ) && searchQuery.match(/^[a-zA-Z\s\-'.,]+$/) && (
                  <CommandItem
                    value={searchQuery}
                    onSelect={() => {
                      onChange(searchQuery)
                      setOpen(false)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    <div>
                      <span>Use "{searchQuery}"</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
