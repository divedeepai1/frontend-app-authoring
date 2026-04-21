import { useEffect, useMemo, useState } from "react"
import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../cms-csrftoken"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router"
import docIcon from "../../assests/document.svg"
import viewIcon from "../../assests/view-button.svg"
import CourseResourcesDialog from "./CourseResourcesDialog"
import { base_url } from "../../../compugrade-constants"
import LessonScheduleModal from "./LessonScheduleModal"
import LessonTimerModal from "./LessonTimerModal"
import LessonAttemptsModal from "./LessonAttemptsModal"

function CourseScreen() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [chapters, setChapters] = useState([])
  const [lessons, setLessons] = useState([])
  const [verticals, setVerticals] = useState([])
  const [expandedChapters, setExpandedChapters] = useState({})
  const [expandedLessons, setExpandedLessons] = useState({})
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false)
  const [scheduleContext, setScheduleContext] = useState(null)
  const [timerContext, setTimerContext] = useState(null)
  const [attemptContext, setAttemptContext] = useState(null)
  const [classStudents, setClassStudents] = useState([])

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
      
      // Initialize expanded state for lessons (default false)
      const newLessonExpanded = {};
      (data?.lessons || []).forEach((lesson) => {
        newLessonExpanded[lesson.id] = lesson.is_expanded || false;
      });
      setExpandedLessons(newLessonExpanded);
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

  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedClassId) {
        setClassStudents([])
        return
      }
      const token = await fetchCsrfToken();
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${selectedClassId}/students-list/`,
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
        setClassStudents(result?.students || []);
      } catch (error) {
        console.error("Error:", error.message);
        setClassStudents([]);
      }
    }
    fetchStudentsForClass()
  }, [selectedClassId])

  const lessonsByChapter = useMemo(() => {
    const byChapter = {};
    lessons.forEach(ls => {
      const key = String(ls.chapter_id ?? ls.chapterId ?? ls.parent_chapter_id ?? "");
      if (!key) return;
      if (!byChapter[key]) byChapter[key] = [];
      byChapter[key].push(ls);
    });
    return byChapter;
  }, [lessons])

  const verticalsByLesson = useMemo(() => {
    const byLesson = {};
    verticals.forEach(v => {
      const key = String(
        v.lesson_id ??
        v.lessonId ??
        v.parent_lesson_id ??
        v.subsection_lesson_id ??
        ""
      );
      if (!key) return;
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

  const toggleLessonUiExpanded = (lessonId) => {
    const currentState = expandedLessons[lessonId] || false;
    const newState = !currentState;
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: newState
    }));
  }

  const updateLessonExpanded = async (lessonId, isExpanded) => {
    if (!selectedCourse) return;
    
    try {
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            lesson_id: lessonId,
            course_key: selectedCourse,
            is_expanded: isExpanded,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update lesson expanded state: ${response.status} ${errorText}`);
      }
      
      // Update local state on success
      setExpandedLessons(prev => ({
        ...prev,
        [lessonId]: isExpanded
      }));
    } catch (error) {
      console.error("Error updating lesson expanded state:", error.message);
      // Revert the UI change on error
      setExpandedLessons(prev => ({
        ...prev,
        [lessonId]: !isExpanded
      }));
    }
  }

  const toggleLessonExpanded = (lessonId) => {
    const currentState = expandedLessons[lessonId] || false;
    const newState = !currentState;
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: newState
    }));
    updateLessonExpanded(lessonId, newState);
  }

  const handleOpenSchedule = (lesson, vertical) => {
    if (!lesson || !vertical) return;
    const rubricId =
      vertical?.id ||
      "";
    setScheduleContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId,
    });
  }

  const handleCloseSchedule = () => {
    setScheduleContext(null);
  }

  const handleOpenTimerSetup = (lesson, vertical) => {
    if (!lesson || !vertical) return;
    const rubricId = vertical?.id || "";
    setTimerContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId,
    });
  }

  const handleCloseTimerSetup = () => {
    setTimerContext(null);
  }

  const handleOpenAttemptsSetup = (lesson, vertical) => {
    if (!lesson || !vertical) return;
    const rubricId = vertical?.id || "";
    setAttemptContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId,
    });
  }

  const handleCloseAttemptsSetup = () => {
    setAttemptContext(null);
  }

  return (
    <div>
      <style>{`
        select:focus,
        select:active {
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
      <div className="col-md-12 d-flex py-4">
        <div className="col-md-4">
          <div className="d-flex align-items-center">
            <label htmlFor="classSelect" className="mr-2" style={{fontWeight: "600"}} >
              Select Class :
            </label>
            <select
              id="classSelect"
              style={{
                boxShadow: "none",
                outline: "none",
                borderColor: "#6B7280",
                color: "#111827",
                height: 36,
                padding: "0 40px 0 8px",
                lineHeight: 1.5,
                border: "1px solid #6B7280",
                borderRadius: "4px",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "14px",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {Array.isArray(classes) && classes.length > 0 ? (
                classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))
              ) : (
                <option value="">No relevant class</option>
              )}
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
              style={{
                boxShadow: "none",
                outline: "none",
                borderColor: "#6B7280",
                color: "#111827",
                height: 36,
                padding: "0 40px 0 8px",
                lineHeight: 1.5,
                border: "1px solid #6B7280",
                borderRadius: "4px",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "14px",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {Array.isArray(courses) && courses.length > 0 ? (
                courses.map(crs => (
                  <option key={crs.id} value={crs.id}>{crs.display_name}</option>
                ))
              ) : (
                <option value="">No courses</option>
              )}
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
                  Add Resources
                </button>
                <button
                  className="primary-button px-4 py-2 ml-3"
                  onClick={() => navigate("/curriculum/gradebook")}
                >
                  View Gradebook
                </button>
                {/* <button className="secondary-button px-4 py-2 ml-3">Customize this Course</button> */}
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
                    {(lessonsByChapter[String(chapter.id)] || []).map((lesson, lidx) => (
                      <div key={lesson.id || lidx} className="lesson-row lesson border-top py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-start" style={{ width: "100%" }}>
                            <div 
                              className="mr-2 d-flex primary-text align-items-center mt-2" 
                              style={{ cursor: "pointer", minWidth: "24px" }}
                              
                              onClick={() => toggleLessonUiExpanded(lesson.id)}
                            >
                              {expandedLessons[lesson.id] ? (
                                <ChevronDown size={20} />
                              ) : (
                                <ChevronRight size={20} />
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div 
                                className="mb-2 d-flex align-items-center" 
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleLessonUiExpanded(lesson.id)}
                              >
                                <span className="primary-text mr-2" style={{fontWeight:"600" , fontSize:"20px" }}>•</span>
                                <span>{lesson.title}</span>
                              </div>
                              {expandedLessons[lesson.id] && (verticalsByLesson[String(lesson.id)] || []).length > 0 && (
                                <div className="ml-3">
                                  {(verticalsByLesson[String(lesson.id)] || []).map((v, vidx) => (
                                    <div 
                                      key={v.id || vidx} 
                                      className="d-flex align-items-center py-1" 
                                      style={{ 
                                        gap: "8px",
                                        borderBottom: vidx < (verticalsByLesson[String(lesson.id)] || []).length - 1 ? "1px solid #E5E7EB" : "none"
                                      }}
                                    >
                                      <span>{v.title}</span>
                                      <button
                                        className="primary-button px-2 py-2 ml-auto"
                                        style={{ fontSize: 12, whiteSpace: "nowrap", marginLeft: "auto" }}
                                        onClick={() => handleOpenSchedule(lesson, v)}
                                      >
                                        Schedule Access
                                      </button>
                                      <button
                                        className="secondary-button px-2 py-2"
                                        style={{ fontSize: 12, whiteSpace: "nowrap" }}
                                        onClick={() => handleOpenTimerSetup(lesson, v)}
                                      >
                                        Setup Timer
                                      </button>
                                      <button
                                        className="secondary-button px-2 py-2"
                                        style={{ fontSize: 12, whiteSpace: "nowrap" }}
                                        onClick={() => handleOpenAttemptsSetup(lesson, v)}
                                      >
                                        Setup Attempts
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <label 
                              className="d-flex align-items-center" 
                              style={{ cursor: "pointer", gap: "8px", fontSize: "14px", whiteSpace: "nowrap" }}
                            >
                              <span className="primary-text" style={{ fontWeight: "500" }}>
                                Expand subsection
                              </span>
                              <div
                                onClick={() => toggleLessonExpanded(lesson.id)}
                                style={{
                                  position: "relative",
                                  width: "44px",
                                  height: "24px",
                                  borderRadius: "12px",
                                  backgroundColor: expandedLessons[lesson.id] ? "#255A71" : "#ccc",
                                  transition: "background-color 0.3s ease",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "2px",
                                    left: expandedLessons[lesson.id] ? "22px" : "2px",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    transition: "left 0.3s ease",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  }}
                                />
                              </div>
                            </label>
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

      <CourseResourcesDialog
        isOpen={isResourcesDialogOpen}
        onClose={() => setIsResourcesDialogOpen(false)}
        classId={selectedClassId}
        courseId={selectedCourse}
      />

      <LessonScheduleModal
        isOpen={!!scheduleContext}
        onClose={handleCloseSchedule}
        courseId={selectedCourse}
        title={scheduleContext ? `${scheduleContext.verticalTitle || ""} • ${scheduleContext.lessonTitle || ""}` : ""}
        students={classStudents}
        rubricId={scheduleContext ? scheduleContext.rubricId : ""}
      />

      <LessonTimerModal
        isOpen={!!timerContext}
        onClose={handleCloseTimerSetup}
        title={timerContext ? `${timerContext.verticalTitle || ""} • ${timerContext.lessonTitle || ""}` : ""}
        students={classStudents}
        rubricId={timerContext ? timerContext.rubricId : ""}
      />

      <LessonAttemptsModal
        isOpen={!!attemptContext}
        onClose={handleCloseAttemptsSetup}
        title={attemptContext ? `${attemptContext.verticalTitle || ""} • ${attemptContext.lessonTitle || ""}` : ""}
        students={classStudents}
        rubricId={attemptContext ? attemptContext.rubricId : ""}
      />
    </div>
  )
}

export default CourseScreen
