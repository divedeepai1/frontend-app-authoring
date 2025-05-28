
const AssignCourses = ({ formData, handleCourseSelection, nextStep, prevStep }) => (
<div className="p-4 class-div-style">
            <h3 className="primary-text mb-3">Assign Courses</h3>
          <p className="mb-4">These are your purchased courses and you can assign multiple courses to any class.</p>
            
        <div className="row mb-4">
             <div className="col-md-6">
               <div className="card position-relative " style={{ height: '100%',width:'60%' }}>
                 <div className="card-body d-flex justify-content-center">

                  <div className="text-center">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" alt="Word" style={{ width: '60px', height: '60px' }} />
                  <h5 className="mt-2">LBD Microsoft 365<br />Word-1</h5>
                  </div>
                   <div className="form-check position-absolute" style={{ top: '5px', right: '5px' }}>
                      <input
                      style={{width:'18px',height:'18px'}}
                        className="form-check-input"
                        type="checkbox"
                        id="word"
                        checked={formData.selectedCourses.includes('word')}
                        onChange={() => handleCourseSelection('word')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="btn btn-outline-primary mb-4">View Course Library</button>
            
            <div className="d-flex  justify-content-between">
              <div className="d-flex">
              <button className="primary-button px-4 py-2" onClick={nextStep}>Next</button>
              <button className="secondary-button px-4 ml-3" onClick={prevStep}>Back</button>
              </div>
              <div className="ms-auto">
                <a href="#" className="primary-text">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
export default AssignCourses;
