import React, { useState } from "react";
import { Menu, X, Store, Search, Home } from "lucide-react";
import { SelectedStore } from "../types";
import { LocationSelector } from "./LocationSelector";

interface HeaderProps {
  selectedStores: SelectedStore[];
  onViewChange: (view: "home" | "stores" | "products" | "comparison") => void;
  currentView: "home" | "stores" | "products" | "comparison";
  userLocation: string;
  onLocationChange: (location: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedStores,
  onViewChange,
  currentView,
  userLocation,
  onLocationChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", icon: Home, view: "home" as const },
    { name: "Stores", icon: Store, view: "stores" as const },
    { name: "Products", icon: Search, view: "products" as const },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-green-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-22">
          {/* Logo */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={() => onViewChange("home")}
              className="flex items-center space-x-2 lg:space-x-3 hover:opacity-90 transition-opacity"
            >
              <div className="h-14 lg:h-16 flex items-center justify-center py-2">
                <img
                  src="/TML NZ - 5 copy.png"
                  alt="Tradie Materials Live NZ"
                  className="h-full w-auto max-w-[240px] lg:max-w-[280px] object-contain"
                  style={{
                    maxHeight: "56px",
                  }}
                />
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => onViewChange(item.view)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Location Selector */}
            <div className="hidden sm:block">
              <LocationSelector
                userLocation={userLocation}
                onLocationChange={onLocationChange}
              />
            </div>

            {/* Selected Stores Indicator */}
            {selectedStores.length > 0 && (
              <div className="hidden md:flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg">
                <Store className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-xs lg:text-sm font-medium">
                  {selectedStores.length} store
                  {selectedStores.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onViewChange(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Location Selector */}
            <div className="mt-4 pt-4 border-t border-gray-200 sm:hidden">
              <LocationSelector
                userLocation={userLocation}
                onLocationChange={onLocationChange}
              />
            </div>

            {/* Mobile Selected Stores */}
            {selectedStores.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
                <div className="flex items-center space-x-2 text-yellow-800 px-3 py-2">
                  <Store className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedStores.length} store
                    {selectedStores.length > 1 ? "s" : ""} selected
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
