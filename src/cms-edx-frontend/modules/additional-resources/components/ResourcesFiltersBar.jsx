export default function ResourcesFiltersBar({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="tp-resources-toolbar">
      <div className="tp-resources-filters">
        <div className="tp-resources-inline-field">
          <label className="tp-resources-inline-label" htmlFor="tp-res-category">
            Category:
          </label>
          <select
            id="tp-res-category"
            className="tp-resources-select tp-resources-select-wide"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {Array.isArray(categories) && categories.length > 0
              ? categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              : null}
          </select>
        </div>
      </div>
    </div>
  )
}
