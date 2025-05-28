const BulkStudentForm = () => (
    <form>
      <h3 className="primary-text">Add Bulk Students to your class</h3>
      <div className="row">
        <div className="col-md-6 mt-3">
        
          <label>Number of Students</label>
          <input required className="form-control bg-transparent mb-2" />
          </div>

        <div className="col-md-6 mt-3">
        <label>Username Prefix</label>
        <input required className="form-control bg-transparent mb-2" />
        </div>

        <div className="col-md-12 mt-4">
          <label>Initial Password </label>
          <input required className="form-control bg-transparent mb-2" />
        </div>
      </div>
      <div className="mt-2">
      <button className="primary-button px-4 py-2">Add Students</button>
      <button className="secondary-button px-4 py-2 ml-3">Cancel</button>
        </div>
    </form>
  );
  
  export default BulkStudentForm;
  