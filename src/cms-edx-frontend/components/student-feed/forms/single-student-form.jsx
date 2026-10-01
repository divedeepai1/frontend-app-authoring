import { useState } from "react"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { getConfig } from "@edx/frontend-platform"
import { useNavigate } from "react-router"
import { tpToast } from "../../common/tpToast"

const SingleStudentForm = ({ setSelectedOption, setAddStudents, isNewStudent, onStudentAdded }) => {
  const navigate = useNavigate()
  const [studentData, setStudentData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    email: "",
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleChange = (e) => {
    if (isAdding) return
    const { name, value } = e.target
    if ((name === "firstName" || name === "lastName") && /[^a-zA-Z\s]/.test(value)) {
      return
    }
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsAdding(true)

    try {
      const id = sessionStorage.getItem("classId")
      const token = await fetchCsrfToken()

      const data = JSON.stringify({
        username: studentData.username,
        first_name: studentData.firstName,
        password: studentData.password,
        last_name: studentData.lastName,
        email: studentData.email,
      })

      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${id}/add-student/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: data,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add: ${response.status} ${errorText}`)
      }

      await response.json()
      tpToast.success("Student added successfully")
      if (isNewStudent) {
        navigate(-1)
      } else if (onStudentAdded) {
        onStudentAdded()
      } else {
        setAddStudents(false)
      }
    } catch (error) {
      tpToast.error("Unable to add student", error?.message || "Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    if (isAdding) return
    setSelectedOption(null)
    setAddStudents(false)
  }

  return (
    <form onSubmit={handleSubmit} className="tp-student-form">
      <h3 className="tp-title tp-student-form-title">Add a single student</h3>
      <p className="tp-subtitle tp-student-form-desc">Enter student details to add them to this class.</p>

      <div className="tp-grid-2">
        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-student-username">
            Student username <span className="tp-required">*</span>
          </label>
          <input
            id="tp-student-username"
            name="username"
            value={studentData.username}
            onChange={handleChange}
            required
            className="tp-input"
            autoComplete="off"
            disabled={isAdding}
          />
        </div>
        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-student-password">
            Password <span className="tp-required">*</span>
          </label>
          <input
            id="tp-student-password"
            name="password"
            type="password"
            value={studentData.password}
            onChange={handleChange}
            required
            className="tp-input"
            autoComplete="new-password"
            disabled={isAdding}
          />
        </div>
        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-student-first-name">
            First name <span className="tp-required">*</span>
          </label>
          <input
            id="tp-student-first-name"
            name="firstName"
            value={studentData.firstName}
            onChange={handleChange}
            required
            className="tp-input"
            autoComplete="given-name"
            disabled={isAdding}
          />
        </div>
        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-student-last-name">
            Last name <span className="tp-required">*</span>
          </label>
          <input
            id="tp-student-last-name"
            name="lastName"
            value={studentData.lastName}
            onChange={handleChange}
            required
            className="tp-input"
            autoComplete="family-name"
            disabled={isAdding}
          />
        </div>
      </div>

      <div className="tp-field">
        <label className="tp-label" htmlFor="tp-student-email">
          Email address <span className="tp-required">*</span>
        </label>
        <input
          id="tp-student-email"
          type="email"
          name="email"
          value={studentData.email}
          onChange={handleChange}
          required
          className="tp-input"
          autoComplete="email"
          disabled={isAdding}
        />
      </div>

      <div className="tp-student-form-actions">
        <button type="submit" className="tp-btn tp-btn-primary" disabled={isAdding} aria-busy={isAdding}>
          {isAdding ? "Adding student…" : "Add student"}
        </button>
        <button type="button" className="tp-btn tp-btn-secondary" onClick={handleCancel} disabled={isAdding}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default SingleStudentForm
