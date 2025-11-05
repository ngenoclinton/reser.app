"use client"

import { useState } from "react"
import { Search, Grid2X2, List, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

export default function RoomFilters({ rooms, onFiltersChange, onViewChange, currentView = "grid" }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [capacityRange, setCapacityRange] = useState([1, 100])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState(false)

  const handleSearch = (value) => {
    setSearchQuery(value)
    applyFilters(value, capacityRange, priceRange)
  }

  const handleCapacityChange = (value) => {
    setCapacityRange(value)
    applyFilters(searchQuery, value, priceRange)
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
    applyFilters(searchQuery, capacityRange, value)
  }

  const applyFilters = (search, capacity, price) => {
    const filtered = rooms.filter((room) => {
      const matchesSearch =
        !search ||
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.description.toLowerCase().includes(search.toLowerCase()) ||
        room.location.toLowerCase().includes(search.toLowerCase())

      const matchesCapacity = room.capacity >= capacity[0] && room.capacity <= capacity[1]

      const matchesPrice = room.price_per_hour >= price[0] && room.price_per_hour <= price[1]

      return matchesSearch && matchesCapacity && matchesPrice
    })

    const hasActiveFilters =
      search || capacityRange[0] > 1 || capacityRange[1] < 100 || priceRange[0] > 0 || priceRange[1] < 500

    setActiveFilters(hasActiveFilters)
    onFiltersChange(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCapacityRange([1, 100])
    setPriceRange([0, 500])
    setActiveFilters(false)
    onFiltersChange(rooms)
  }

  const maxPrice = Math.max(...rooms.map((r) => r.price_per_hour), 500)
  const maxCapacity = Math.max(...rooms.map((r) => r.capacity), 100)

  return (
    <div className="mb-8">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" size={20} />
          <Input
            type="text"
            placeholder="Search rooms by name, location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-border rounded-lg p-1">
          <Button
            variant={currentView === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("grid")}
            className="gap-2"
          >
            <Grid2X2 size={18} />
            Grid
          </Button>
          <Button
            variant={currentView === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("list")}
            className="gap-2"
          >
            <List size={18} />
            List
          </Button>
        </div>

        {/* Filters Toggle */}
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter size={18} />
          Filters{" "}
          {activeFilters && (
            <span className="ml-1 text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5">Active</span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6 mb-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            {activeFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive hover:text-destructive/90"
              >
                <X size={18} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">
                Capacity: {capacityRange[0]} - {capacityRange[1]} people
              </label>
              <Slider
                value={capacityRange}
                onValueChange={handleCapacityChange}
                min={1}
                max={maxCapacity}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>Min: 1</span>
                <span>Max: {maxCapacity}</span>
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">
                Price per hour: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                min={0}
                max={maxPrice}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>Min: $0</span>
                <span>Max: ${maxPrice}</span>
              </div>
            </div>

            {/* Filter Stats */}
            <div className="pt-4 border-t border-border text-sm text-foreground/70">
              Showing {rooms.length} available spaces
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
