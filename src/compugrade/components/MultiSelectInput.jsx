import React, { useEffect, useRef, useState } from 'react';
import './MultiSelectInput.css';
import { base_url } from '../../compugrade-constants';

export default function MultiSelectInput({search, setSearch, selected, setSelected}) {

  const wrapperRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_url}/api/openedx/get_skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
      const fetchedOptions = data?.skills?.map((item) => {
        const rubricString = item.rubric_titles?.join(', ') || '';
        const label = rubricString
          ? `${item.skill} - Already used in lesson: ${rubricString}`
          : item.skill;

        return {
          label: label,
          value: item.skill,
          color: item.color || 'orange',
        };
      }) || [];
      setOptions(fetchedOptions);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((sel) => sel.value === opt.value)
  );

  const handleSelect = (option) => {
    setSelected([...selected, option]);
    setSearch('');
  };

  const handleRemove = (value) => {
    setSelected(selected.filter((s) => s.value !== value));
  };

  return (
    <div className="multi-select-wrapper mt-3" ref={wrapperRef}>
      <div className="input-container" onClick={() => setIsDropdownOpen(true)}>
        {selected.map((item) => (
          <span
            key={item.value}
            className={`badge mt-2 ${item.color === 'red' ? 'badge-red' : 'badge-orange'}`}
          >
            {item.value}
            <button onClick={() => handleRemove(item.value)}>&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control p-2"
          style={{ background: '#EFF6F7', outline: 'none' }}
          
          placeholder=""
          onHover={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = '#EFF6F7'; 
          }}
          onFocus={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = '#EFF6F7'; 
            setIsDropdownOpen(true)
          }}
          onBlur={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = '#EFF6F7';
          }}
        />
      </div>

      {isDropdownOpen && filteredOptions.length > 0 && (
        <ul className="dropdown-list">
          {filteredOptions.map((opt) => (
            <li key={opt.value} onClick={() => handleSelect(opt)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
