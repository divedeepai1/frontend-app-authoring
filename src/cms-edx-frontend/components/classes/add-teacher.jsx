import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form, Badge } from 'react-bootstrap';

const AddTeacher = ({ teachers, selectedTeachers, setSelectedTeachers, nextStep }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
        setShowDropdown(false);
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); 
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  
  const getFilteredTeachers = () => {
    return teachers.filter(
      (teacher) =>
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTeachers.some((sel) => sel.email === teacher.email)
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectTeacher = (teacher) => {
    if (!selectedTeachers.some((t) => t.email === teacher.email)) {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
    setSearchTerm('');
    setShowDropdown(false);
    inputRef.current.focus();
  };

  const handleRemoveTeacher = (email) => {
    const updated = selectedTeachers.filter((t) => t.email !== email);
    setSelectedTeachers(updated);
    setShowDropdown(true);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const filteredOptions = getFilteredTeachers();

  return (
    <div className="container mb-5 border rounded shadow-sm p-5">
      <Form onSubmit={(e) => nextStep(e)} className="p-4 class-div-style">
        <h3 className="primary-text mb-4">Add More Teachers</h3>

        <Form.Group controlId="formTeachers" className="mb-4" ref={wrapperRef}>
          <Form.Label><strong>Email Address *</strong></Form.Label>

          <div
            ref={containerRef}
            className="d-flex flex-wrap align-items-center form-control position-relative"
            onClick={handleInputClick}
            style={{ minHeight: '60px', cursor: 'text' }}
          >
            {selectedTeachers.map((teacher) => (
              <Badge
                key={teacher.email}
                pill
                bg="light"
                className="border mt-1 px-2 py-1 text-dark"
                style={{ cursor: 'pointer',fontSize:"18px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTeacher(teacher.email);
                }}
              >
                <span className='mt-1'>{teacher.email} &times;</span> 
              </Badge>
            ))}

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by email..."
              autoComplete="off"
              className="border-0 flex-grow-1"
              style={{ outline: 'none', flex: 1 }}
              onFocus={handleInputClick}
            />
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="border bg-white position-absolute mt-1 shadow-sm rounded"
              style={{
                zIndex: 1000,
                width: containerRef.current?.offsetWidth || '100%',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((teacher) => (
                  <div
                    key={teacher.email}
                    className="p-2 dropdown-item"
                    onMouseDown={() => handleSelectTeacher(teacher)}
                    style={{ cursor: 'pointer' }}
                  >
                    {teacher.email}
                  </div>
                ))
              ) : (
                <div className="p-2 text-muted">No results found</div>
              )}
            </div>
          )}
        </Form.Group>

        <div className="d-flex mt-4">
          <button className="primary-button px-3 py-2" disabled={selectedTeachers.length == 0}>Add Teacher</button>
          <button
            type="button"
            className="ms-3 px-3 secondary-button py-2 ml-3"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AddTeacher;
