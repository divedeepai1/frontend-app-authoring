import SelectionCheckbox from "../selection/SelectionCheckbox"
import UnitActionButtons from "../UnitActionButtons"

export default function UnitRow({
  vertical,
  checked,
  onToggleSelection,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  return (
    <tr className="tp-curriculum-row tp-curriculum-row--unit">
      <td className="tp-curriculum-td--select" aria-hidden="true" />
      <td className="tp-curriculum-td--unit">
        <div className="tp-curriculum-unit-inner">
          <SelectionCheckbox
            id={`tp-curriculum-unit-${vertical.id}`}
            checked={checked}
            onChange={() => onToggleSelection(vertical.id)}
            ariaLabel={`Select ${vertical.title}`}
          />
          <span className="tp-curriculum-unit-title">{vertical.title}</span>
        </div>
      </td>
      <td className="tp-curriculum-td--actions">
        <UnitActionButtons
          onPreview={onPreview}
          onTimer={onTimer}
          onAttempts={onAttempts}
          onSchedule={onSchedule}
        />
      </td>
    </tr>
  )
}
