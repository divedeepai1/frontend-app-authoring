const SingleStudentForm = () => (
    <form>
      <h3 className="primary-text">Add a Single Student to your class</h3>
      <div className="row">
        <div className="col-md-6 mt-3">
        <div className="mt-2">
         <label>Student's Username *</label>
          <input  required className="form-control bg-transparent mb-2" />
          </div>
          <div className="mt-2">
          <label>Student's First Name *</label>
          <input required  className="form-control bg-transparent mb-2" />
          </div>
         
        </div>
        <div className="col-md-6 mt-3">
            <div className="mt-2">
            <label>Student's Password *</label>
          <input  required  className="form-control bg-transparent mb-2" />
          </div>
            <div className="mt-2">
            <label>Student's Last Name *</label>
          <input required  className="form-control bg-transparent mb-2" />
            </div>
        </div>
        <div className="col-md-12 mt-2">
          <label>Student Email Address *</label>

          <input type="email"  required className="form-control bg-transparent mb-2" />
          </div>
      </div>
      <div className="mt-2">
      <button className="primary-button px-4 py-2 ">Add Student</button>
      <button className="secondary-button px-4 py-2 ml-3">Cancel</button>
      </div>
    </form>
  );
  
  export default SingleStudentForm;
  