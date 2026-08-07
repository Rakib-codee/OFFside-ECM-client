"use client";

import { ALL_SIZES } from "@/lib/products";
import {
  ALL_TEAMS,
  CATEGORY_LABELS,
  PRICE_CEILING,
  type ShopFilters,
} from "@/lib/shop-filters";
import type { Category, Size } from "@/lib/types";

interface FilterControlsProps {
  filters: ShopFilters;
  onChange: (next: ShopFilters) => void;
}

/** Shared filter form — sidebar on desktop, bottom sheet body on mobile. */
export default function FilterControls({ filters, onChange }: FilterControlsProps) {
  const toggleTeam = (team: string) => {
    const teams = filters.teams.includes(team)
      ? filters.teams.filter((entry) => entry !== team)
      : [...filters.teams, team];
    onChange({ ...filters, teams });
  };

  const toggleSize = (size: Size) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((entry) => entry !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes });
  };

  const setCategory = (category: Category | null) => {
    onChange({ ...filters, category, tag: null });
  };

  return (
    <div className="flex flex-col gap-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider">Category</legend>
        <div className="flex flex-col gap-1.5">
          <FilterOption
            label="All"
            isActive={filters.category === null}
            onClick={() => setCategory(null)}
          />
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => (
            <FilterOption
              key={category}
              label={CATEGORY_LABELS[category]}
              isActive={filters.category === category}
              onClick={() => setCategory(category)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider">Team</legend>
        <div className="flex flex-col gap-1.5">
          {ALL_TEAMS.map((team) => (
            <label key={team} className="flex cursor-pointer items-center gap-2 text-sm text-secondary hover:text-primary">
              <input
                type="checkbox"
                checked={filters.teams.includes(team)}
                onChange={() => toggleTeam(team)}
                className="h-4 w-4 accent-[#ff3b30]"
              />
              {team}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider">Size</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={filters.sizes.includes(size)}
              onClick={() => toggleSize(size)}
              className={`h-9 min-w-[44px] rounded-full border px-3 text-sm transition-colors ${
                filters.sizes.includes(size)
                  ? "border-transparent bg-white text-black"
                  : "border-line text-secondary hover:text-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider">
          Max price: <span className="tnum">${filters.maxPrice}</span>
        </legend>
        <input
          type="range"
          min={50}
          max={PRICE_CEILING}
          step={5}
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          className="w-full accent-[#ff3b30]"
          aria-label="Maximum price"
        />
      </fieldset>
    </div>
  );
}

function FilterOption({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`w-fit text-left text-sm transition-colors ${
        isActive ? "font-semibold text-primary" : "text-secondary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}
