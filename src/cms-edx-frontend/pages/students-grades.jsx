import TeacherPortalShell from "../layout/TeacherPortalShell"
import { Container } from "react-bootstrap"
import StudentDashboard from "../components/student-detail/student-dashboard"
import { useEffect, useState } from "react"
import "../theme/teachers-portal-scope.css"

const StudentsGrades = () => {
  const [classData, setClassData] = useState(null)
  const [studentName, setStudentName] = useState("")

  useEffect(() => {
    const storedClassData = sessionStorage.getItem("classData")
    const storedStudentName = sessionStorage.getItem("student-name")

    if (storedClassData) {
      try {
        setClassData(JSON.parse(storedClassData))
      } catch {
        setClassData(null)
      }
    }

    if (storedStudentName) {
      setStudentName(storedStudentName)
    }
  }, [])

  const subtitle = [classData?.name, studentName].filter(Boolean).join(" · ") || undefined

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
        <TeacherPortalShell headerTitle="Manage Classes & Students" headerSubtitle={subtitle}>
          <div className="tp-portal-page">
            <section className="px-0 py-2">
              <Container>
                <StudentDashboard classData={classData} studentName={studentName} />
              </Container>
            </section>
          </div>
        </TeacherPortalShell>
      </div>
    </div>
  )
}

export default StudentsGrades
