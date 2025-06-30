import { Container, Row, Col } from "react-bootstrap"
import { OnboardingStep } from "./onboarding-step"
import { useEffect, useState } from "react";

export function WelcomeSection() {
  const [data, setData] = useState(null);

  useEffect(() => {

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const raw = getCookie("edx-user-info");
    if (raw) {
      try {
        const fixed = raw.replace(/\\054/g, ",");
        const parsed = JSON.parse(fixed);
        setData(JSON.parse(parsed));
      } catch (error) {
        console.error("Failed to parse edx-user-info cookie:", error);
      }
    }
  }, []);
  return (
    <section className="py-4 px-5 text-white" style={{ background: "linear-gradient(90deg, #255A71 48.06%, #0096D7 100%)" }}>
      <Container>
      
        <h2 className="display-5 fw-bold mb-2 text-white">Welcome, {data?.username.charAt(0).toUpperCase() + data?.username.slice(1)} – Let's Get You Started!</h2>
        <p className="mb-4">
          Follow these steps to set up your account and tools for success. We've tailored this checklist based on your
          purchases
        </p>

        <Row className="g-4">
          <Col md={4}>
            <OnboardingStep
              number="01"
              title="Step 1: Prepare for Compugrade.com"
              description="Ensure your account is ready by reviewing system requirements and prerequisites."
              buttonText="View Prerequisites"
            />
          </Col>

          <Col md={4}>
            <OnboardingStep
              number="02"
              title="Step 2: Install the Auto-grader Add-in"
              description="Install the tools you need for your courses. You'll be prompted based on your purchases."
              buttonText="Install for Microsoft Word"
            />
          </Col>

          <Col md={4}>
            <OnboardingStep
              number="03"
              title="Step 3: Start Your First Class"
              description="Create your first class and invite your students to begin learning."
              buttonText="View Class Setup Guide"
            />
          </Col>
        </Row>
      </Container>
    </section>
  )
}
