import React, { useEffect, useRef, useState } from 'react';
import './MultiSelectInput.css';
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from '@edx/frontend-platform';



const OPTIONS = [
 
];

export default function MultiSelectInput({search, setSearch, selected, setSelected}) {

  const wrapperRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
    const token= await fetchCsrfToken(); 
      try {
        const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/writer-engine/skills-list/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token, 
          },
        });
        const data = await response.json();
        data?.skills?.forEach((item) => {
          OPTIONS.push({
            label: item,
            value: item,
            color: item.color || 'orange',
          });
        });
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

  const filteredOptions = OPTIONS.filter(
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
    <div className="multi-select-wrapper" ref={wrapperRef}>
      <div className="input-container" onClick={() => setIsDropdownOpen(true)}>
        {selected.map((item) => (
          <span
            key={item.value}
            className={`badge mt-2 ${item.color === 'red' ? 'badge-red' : 'badge-orange'}`}
          >
            {item.label}
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
