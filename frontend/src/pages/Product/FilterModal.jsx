"use client"

import type React from "react"
import { useState } from "react"
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: any) => void
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    price: "",
    metal: "",
    gender: "",
    caratWeight: "",
    gemstoneShape: "",
  })

  const [openDropdowns, setOpenDropdowns] = useState < { [key: string]: boolean } > ({})

  const filterOptions = {
    price: ["Below ₹10,000", "₹10,001 - ₹25,000", "₹25,001 - ₹50,000", "₹50,001 - ₹1,00,000", "₹1,00,001 - ₹2,00,000", "Above ₹2,00,001"],
    metal: ["18k Gold", "22k Gold", "Silver", "Platinum", "Brass"],
    gender: ["Men", "Women"],
    caratWeight: ["1-2", "2-4", "4-6", "6-8", "8 Above"],
    gemstoneShape: ["Cushion", "Cushion Rectangular", "Emerald Cut", "Heart", "Marquise", "Round", "Square"],
  }

  const toggleDropdown = (filterName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }))
  }

  const handleFilterSelect = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
    setOpenDropdowns((prev) => ({
      ...prev,
      [filterName]: false,
    }))
  }

  const handleApplyFilters = () => {
    const formattedFilters: any = { ...filters }

    // Convert price string to minPrice and maxPrice numbers
    if (filters.price) {
      if (filters.price.includes("Below")) {
        formattedFilters.maxPrice = 10000;
      } else if (filters.price.includes("Above")) {
        formattedFilters.minPrice = 200001;
      } else {
        const parts = filters.price.replace(/₹|,/g, "").split(" - ");
        formattedFilters.minPrice = Number(parts[0]);
        formattedFilters.maxPrice = Number(parts[1]);
      }
    }

    // Convert caratWeight string to minCarat and maxCarat numbers
    if (filters.caratWeight) {
      if (filters.caratWeight.includes("Above")) {
        formattedFilters.minCarat = 8;
      } else {
        const parts = filters.caratWeight.split("-");
        formattedFilters.minCarat = Number(parts[0]);
        formattedFilters.maxCarat = Number(parts[1]);
      }
    }

    onApplyFilters(formattedFilters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      price: "",
      metal: "",
      gender: "",
      caratWeight: "",
      gemstoneShape: "",
    })
  }

  if (!isOpen) return null

  const FilterDropdown = ({
    label,
    filterKey,
    options,
  }: {
    label: string
    filterKey: string
    options: string[]
  }) => (
    <div className="relative mb-4">
      <button
        onClick={() => toggleDropdown(filterKey)}
        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-left text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium">{filters[filterKey as keyof typeof filters] || label}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform ${openDropdowns[filterKey] ? "rotate-180" : ""}`}
        />
      </button>

      {openDropdowns[filterKey] && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleFilterSelect(filterKey, option)}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-4 border-blue-400">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <FilterDropdown label="Price" filterKey="price" options={filterOptions.price} />
              <FilterDropdown label="Gender" filterKey="gender" options={filterOptions.gender} />
              <FilterDropdown label="Carat Weight" filterKey="caratWeight" options={filterOptions.caratWeight} />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FilterDropdown label="Metal" filterKey="metal" options={filterOptions.metal} />
              <FilterDropdown label="Gemstone Shape" filterKey="gemstoneShape" options={filterOptions.gemstoneShape} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={handleReset}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-8 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal
