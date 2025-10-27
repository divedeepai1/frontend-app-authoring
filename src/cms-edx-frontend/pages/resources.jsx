
import HeaderTop from "../../header";
import { Header } from "../components/header";
import { ManagementSection } from "../components/management-section";
import { Container, Row, Col } from "react-bootstrap";
import { Resources } from "../components/resources";

const ResourcesPage = () => {
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
        <section className="px-5 py-2">
        <Container>
          <main className="py-2 mb-4 border rounded-sm">
           
              <Resources />
            </main>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default ResourcesPage;
