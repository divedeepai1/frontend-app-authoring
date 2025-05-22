const CsvImportForm = () => (
    <form className="">
      <h3 className="primary-text">Import CSV file</h3>
    <p className="mb-2 text-black" style={{fontWeight:"600"}}>your file</p>
      <input type="file" className="form-control mb-2 bg-transparent p-2" style={{height:"50px"}} />
      <div className="mt-3">
      <button className="primary-button px-4 py-2">Add Students</button>
      <button className="secondary-button px-4 py-2 ml-3">Cancel</button>
      </div>
    </form>
  );
  
  export default CsvImportForm;
  