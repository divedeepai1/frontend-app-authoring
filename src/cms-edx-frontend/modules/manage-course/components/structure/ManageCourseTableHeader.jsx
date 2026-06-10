import SelectionCheckbox from "../selection/SelectionCheckbox"

export default function ManageCourseTableHeader({
  checked,
  indeterminate,
  disabled,
  onToggleAll,
}) {
  return (
    <thead>
      <tr>
        <th className="tp-curriculum-th tp-curriculum-th--select">
          <SelectionCheckbox
            id="tp-curriculum-select-all"
            checked={checked}
            indeterminate={indeterminate}
            disabled={disabled}
            onChange={onToggleAll}
            ariaLabel="Select all lessons"
          />
        </th>
        <th className="tp-curriculum-th tp-curriculum-th--structure">Course Structure</th>
        <th className="tp-curriculum-th tp-curriculum-th--actions">Actions</th>
      </tr>
    </thead>
  )
}
