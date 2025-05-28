   const Messages = ({ formData,nextStep, prevStep,handleInputChange }) => (
   <div className="p-4 class-div-style">
            <div className='d-flex justify-content-between mb-4'>
            <h3 className="primary-text ">Send Messages to Class</h3>
            <input type="date" className="form-control bg-transparent" placeholder='Select date range' style ={{width:"35%"}}id="dateRange" name="dateRange" value={formData.dateRange} onChange={handleInputChange} />
            </div>
            <div className="mb-4">
              <textarea
                className="form-control"
                rows="10"
                placeholder="Type your message/announcement here..."
                name="message"
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div className="d-flex  justify-content-between">
              <div className="d-flex">
              <button className="primary-button px-4 py-2" onClick={nextStep}>Create Class</button>
              <button className="secondary-button px-4 ml-3" onClick={prevStep}>Back</button>
              </div>
              <div className="ms-auto">
                <a href="#" className="primary-text">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
export default Messages;