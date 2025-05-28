import HeaderTop from '../../header';
import TeacherDashboard from './teacher-dashboard';
export default function Main() {
  return (
    <div>
     <HeaderTop isHiddenMainMenu/>
     <TeacherDashboard heading={"Teacher Dashboard"} bg={"#F7F7F7"} color={"black"} outline={"outline-black-button"} /> 
  </div>
  )
}


