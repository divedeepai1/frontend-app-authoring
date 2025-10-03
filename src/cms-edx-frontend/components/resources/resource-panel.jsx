
import ResourceSection from "./resource-section"

const guides = [
  "Skill Assessment Tools",
  "Competency Mapping Additional Resources",
  "Self-Assessment Worksheets",
  "Performance Evaluation Templates",
  "Performance Evaluation Templates",
]

const videos = [
  "Setting Up a Competency Framework",
  "Using the Competency Tracking Dashboard",
  "Engaging Students with Interactive Activities",
  "Using the Competency Tracking Dashboard",
  "Customizing Learning Modules for Competencies",
]

export default function ResourcePanel() {
  return (
    
      <div className="p-3">
          <ResourceSection title="Computency Framework Guides" items={guides} />
          <ResourceSection title="How-To Videos" items={videos} className="mt-3" />
        
      </div>
    
  )
}
