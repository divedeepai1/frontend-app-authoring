
import HeaderTop from "../../header";
import { Header } from "../components/header";
import { ManagementSection } from "../components/management-section";
import { Container, Row, Col } from "react-bootstrap";
import ResourcePanel from "../components/resources/resource-panel";
import TableHeader from "../components/resources/title-bar";

const Resources = () => {

    const panelStyle = {
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        boxShadow: "none",
        backgroundColor: "#FFFFFF",
      }
  return (
    <div>
      <HeaderTop isHiddenMainMenu />
      <div className="min-vh-100 bg-white">
        <Header
          heading="Additional Resources"
          bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"
          color="white"
          outline="outline-white-button"
        />
        <ManagementSection />
        <section className="px-6">
          <main className="py-2 mb-4">
            <Container style={panelStyle} >
              <TableHeader />
              <Row className="mt-1">
                <Col>
                  <ResourcePanel />
                </Col>
              </Row>
            </Container>
          </main>
        </section>
      </div>
    </div>
  );
};

export default Resources;
