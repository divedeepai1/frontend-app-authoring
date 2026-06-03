import TpCheckbox from "../common/TpCheckbox"

const CustomCheckbox = ({ id, name, label, checked, onChange }) => (
  <TpCheckbox id={id} name={name} label={label} checked={checked} onChange={onChange} className="tp-checkbox-pref-row" />
)

export default CustomCheckbox
