

import {Container, Navbar} from "react-bootstrap"
const Hello = () => {
  return (
    <div className="bg-gray-100">
      <Container>
      <Navbar>Hello</Navbar>
      <h1 className="p-10">Hello World</h1>
      <p>This is a simple React component.</p>
      <button className="primary-button"></button>
      </Container>
    </div>
  );
}
export default Hello;  