import { Header } from "../components/header"
import { WelcomeSection } from "../components/welcome-section"
import { ManagementSection } from "../components/management-section"
import Feed from "./student-feed";

export default function TeacherDashboard({heading,bg,color,outline}) {
  return (
    <div className="min-vh-100 bg-white">
    <Header heading={heading} bg={bg} color={color} outline={outline}/>
    <main>
      <WelcomeSection />
      <ManagementSection />
      <Feed />
    </main>
  </div>
  )
}


