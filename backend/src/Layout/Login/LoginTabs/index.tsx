import { Card, CardBody, Col } from "reactstrap";
import LoginForm from "./LoginForm";

export default function LoginTabs() {
  return (
    <Col md="7" className="p-0 card-right">
      <Card className="tab2-card"><CardBody>
        <h1 className="h4">HighStyle administration</h1>
        <LoginForm />
        <p className="text-muted mt-3">Staff accounts must be provisioned by an authorized administrator.</p>
      </CardBody></Card>
    </Col>
  );
}
