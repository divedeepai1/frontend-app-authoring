const  CustomCheckbox = ({ id, name, label, checked, onChange }) => (
    <div className="checkbox-wrapper mb-3">
      <label htmlFor={id} className="form-check-label">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="checkbox-input"
        />
        <span className="checkbox-custom">
          {checked && (
            <svg className="checkmark" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20.285 6.709l-11.4 11.4-5.6-5.6L5.7 10.09l3.186 3.186 9.714-9.714z"
              />
            </svg>
          )}
        </span>
        {label}
      </label>
    </div>
  );

export default CustomCheckbox;
  