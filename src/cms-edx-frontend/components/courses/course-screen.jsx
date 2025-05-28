

import { useState } from "react"

import docIcon from "../../assests/document.svg"
import viewIcon from "../../assests/view-button.svg"



function CourseScreen() {
  const [selectedClass, setSelectedClass] = useState("Grade -3")
  const [selectedCourse, setSelectedCourse] = useState("LBD Microsoft Word Level-1")

  const chapters = [
    {
      id: 1,
      title: "Document Basics",
      lessons: [
        { id: 1, title: "Editing Basics" },
        { id: 2, title: "Printing A Document" },
        { id: 3, title: "Customising Quick-Access Toolbar" },
      ],
    },
    
  ]
  const chaptersTwo = [
    {
        id: 2,
        title: "Text Formatting",
        lessons: [
          { id: 1, title: "Top 10 Formulas" },
          { id: 2, title: "Formatting Text with Effects" },
          { id: 3, title: "Enhancing Proof reading Skills" },
        ],
      },
    
  ]
  

  return (
    <div>
    <div className="col-md-12 d-flex py-4">
        <div className="col-md-4">
          <div className="d-flex align-items-center">
            <label htmlFor="classSelect" className="mr-2" style={{fontWeight: "600"}} >
              Select Class :
            </label>
            <select
              id="classSelect"
              className="custom-select-black p-2"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <div className="text-black important">
              <option>Student Class</option>
              </div>
            </select>
          </div>
        </div>
        <div className="col-md-8">
          <div className="d-flex align-items-center">
            <label htmlFor="courseSelect" style={{fontWeight: "600"}} className="mr-2">
              Select Course :
            </label>
            <select
              id="courseSelect"
              className="custom-select-black p-2"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option>LBD Microsoft Word Level-1</option>
            </select>
          </div>
        </div>
    </div>
    <div className="py-4">
      

      <div className="card mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="primary-text m-0">LBD Microsoft 365 Word Level 1</h2>
            <div className="d-flex gap-2">
              <button className="primary-button px-4 py-2">Course Resources</button>
              <button className="secondary-button px-4 py-2 ml-3">Customize this Course</button>
            </div>
          </div>

          <hr className="my-3" />

          {chapters.map((chapter) => (
            <div key={chapter.id} className="chapter-container p-3" style={{ background: "#F5F5F5", borderRadius:"2px"}}>
              <div className="chapter-header primary-text  mb-2 mt-2" style={{ fontSize: "20px", fontWeight: "600" }}>
                Chapter -{chapter.id} : {chapter.title}
              </div>

              <div className="lesson-container">
                {chapter.lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-row lesson border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center justify-content-center lead-0">
                        <span className="primary-text mr-2" style={{fontWeight:"600" , fontSize:"40px"}}>•</span>
                        <span>Lesson -{lesson.id} : </span>
                        <span className="ms-2">{lesson.title}</span>
                      </div>
                      <div className="d-flex">
                        <img
                          src={docIcon} alt="doc"    />
                          <img src={viewIcon}  className="ml-3" alt="view"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {chaptersTwo.map((chapter) => (
            <div key={chapter.id} className="chapter-container p-3 mt-4" style={{ background: "#F5F5F5", borderRadius:"2px"}}>
              <div className="chapter-header primary-text mb-2 mt-2" style={{ fontSize: "20px", fontWeight: "600" }}>
                Chapter -{chapter.id} : {chapter.title}
              </div>

              <div className="lesson-container">
                {chapter.lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-row lesson border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center justify-content-center lead-0">
                        <span className="primary-text mr-2" style={{fontWeight:"600" , fontSize:"40px"}}>•</span>
                        <span>Lesson -{lesson.id} : </span>
                        <span className="ms-2">{lesson.title}</span>
                      </div>
                      <div className="d-flex">
                        <img
                          src={docIcon} alt="doc"    />
                          <img src={viewIcon}  className="ml-3" alt="view"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}

export default CourseScreen
