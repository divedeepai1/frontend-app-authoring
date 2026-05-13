import React from 'react';

const ProgressIndicator = ({ activeStep,activeStepList }) => {
  const steps = [
    { id: 1, name: 'Class Details' },
    { id: 2, name: 'Add Students' },
    { id: 3, name: 'Assign Course(s)' },
    // { id: 4, name: 'Send Messages' }
  ];

  return (
    <div className="d-flex justify-content-between mb-4">
      {steps.map((step) => (
        <div key={step.id} className="position-relative d-flex align-items-center" style={{ width: `${100 / steps.length}%` }}>
          <div
            className={`w-100 py-3 text-center text-white ${activeStep === step.id || activeStepList?.includes(step.id) ? 'primary-shape' : 'secondary-shape'}`}
            style={{
              clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
              paddingLeft: '10px',
              paddingRight: '10px',
              zIndex: step.id
            }}
          >
            {step.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;