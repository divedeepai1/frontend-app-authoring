import { useEffect, useMemo, useState } from "react"
import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../cms-csrftoken"
import { ChevronDown, ChevronRight } from "lucide-react"
import docIcon from "../../assests/document.svg"
import viewIcon from "../../assests/view-button.svg"
import CourseResourcesDialog from "./CourseResourcesDialog"

function CourseScreen() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [chapters, setChapters] = useState([])
  const [lessons, setLessons] = useState([])
  const [verticals, setVerticals] = useState([])
  const [expandedChapters, setExpandedChapters] = useState({})
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false)

  const fetchClasses = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      const cls = result?.classrooms || [];
      setClasses(cls);
      if (cls.length) {
        setSelectedClassId(cls[0].id);
        const firstCourses = cls[0]?.courses || [];
        setCourses(firstCourses);
        if (firstCourses.length) {
          setSelectedCourse(firstCourses[0].id);
          setCourseTitle(firstCourses[0].display_name || "");
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  const fetchCourseIntegration = async (courseKey) => {
    if (!courseKey) return;
    try {
      const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/?course_key=${encodeURIComponent(courseKey)}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to get course integration: ${res.status} ${t}`);
      }
      const data = await res.json();
      setCourseTitle(data?.course?.name || "");
      setChapters(data?.chapters || []);
      setLessons(data?.lessons || []);
      setVerticals(data?.verticals || []);
      
      // Initialize expanded state for all chapters
      const newExpanded = {};
      (data?.chapters || []).forEach((chapter) => {
        newExpanded[chapter.id] = true;
      });
      setExpandedChapters(newExpanded);
    } catch (e) {
      console.error("course-integration error", e);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseIntegration(selectedCourse);
    }
  }, [selectedCourse])

  useEffect(() => {
    const found = classes.find(c => String(c.id) === String(selectedClassId));
    const c = found?.courses || [];
    setCourses(c);
    if (c.length) {
      setSelectedCourse(c[0].id);
      setCourseTitle(c[0].display_name || "");
    } else {
      setSelectedCourse("");
      setCourseTitle("");
    }
  }, [selectedClassId, classes])

  const lessonsByChapter = useMemo(() => {
    const byChapter = {};
    lessons.forEach(ls => {
      const key = ls.chapter_id;
      if (!byChapter[key]) byChapter[key] = [];
      byChapter[key].push(ls);
    });
    return byChapter;
  }, [lessons])

  const verticalsByLesson = useMemo(() => {
    const byLesson = {};
    verticals.forEach(v => {
      const key = v.lesson_id;
      if (!byLesson[key]) byLesson[key] = [];
      byLesson[key].push(v);
    });
    return byLesson;
  }, [verticals])

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  }

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
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
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
              {courses.map(crs => (
                <option key={crs.id} value={crs.id}>{crs.display_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="py-4">
        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="primary-text m-0">{courseTitle || "Course"}</h2>
              <div className="d-flex gap-2">
                <button 
                  className="primary-button px-4 py-2"
                  onClick={() => setIsResourcesDialogOpen(true)}
                >
                  Course Resources
                </button>
                <button className="secondary-button px-4 py-2 ml-3">Customize this Course</button>
              </div>
            </div>

            <hr className="my-3" />

            {chapters.map((chapter, idx) => (
              <div key={chapter.id || idx} className="chapter-container p-3 mb-3" style={{ background: "#F5F5F5", borderRadius:"2px"}}>
                <div 
                  className="chapter-header primary-text mb-2 mt-2 d-flex align-items-center" 
                  style={{ fontSize: "20px", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <span className="mr-2 mb-1">
                    {expandedChapters[chapter.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </span>
                  {chapter.title}
                </div>

                {expandedChapters[chapter.id] && (
                  <div className="lesson-container">
                    {(lessonsByChapter[chapter.id] || []).map((lesson, lidx) => (
                      <div key={lesson.id || lidx} className="lesson-row lesson border-top py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-start" style={{ width: "100%" }}>
                            <span className="primary-text mr-2" style={{fontWeight:"600" , fontSize:"20px" }}>•</span>
                            <div className="flex-grow-1">
                              <div className="mb-2" >{lesson.title}</div>
                              {/* Verticals under each lesson */}
                              {(verticalsByLesson[lesson.id] || []).length > 0 && (
                                <div className="ml-3">
                                  {(verticalsByLesson[lesson.id] || []).map((v, vidx) => (
                                    <div key={v.id || vidx} className="d-flex align-items-center mb-1" style={{ gap: "8px" }}>
                                      
                                      <span>{v.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex">
                            <img src={docIcon} alt="doc" />
                            <img src={viewIcon} className="ml-3" alt="view"/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Resources Dialog */}
      <CourseResourcesDialog
        isOpen={isResourcesDialogOpen}
        onClose={() => setIsResourcesDialogOpen(false)}
        classId={selectedClassId}
        courseId={selectedCourse}
      />
    </div>
  )
}

export default CourseScreen
