import { Navbar, Container, Button } from "react-bootstrap"

export function Header({bg,heading,color,outline}) {
  return (
    <Navbar  expand="lg" className="py-3 px-5" style={{background:bg}}>
      <Container>
        <h3 className="fw-semibold fs-4"  style={{color:color}}>{heading}</h3>
        <div className="d-flex">
          <button className={`${outline} py-2 px-3`}>Login As Student</button>
          <button variant={outline} className={`${outline} ml-3 py-2 px-2`}>Available Courses</button>
        </div>
      </Container>
    </Navbar>
  )
}


