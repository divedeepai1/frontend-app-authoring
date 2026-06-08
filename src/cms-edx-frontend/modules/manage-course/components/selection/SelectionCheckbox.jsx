import TpCheckbox from "../../../../components/common/TpCheckbox"

export default function SelectionCheckbox({
  id,
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  ariaLabel,
  className = "tp-curriculum-selection-checkbox",
}) {
  return (
    <TpCheckbox
      id={id}
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      onChange={onChange}
      ariaLabel={ariaLabel}
      className={className}
    />
  )
}
