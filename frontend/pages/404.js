import React from 'react';
import CommonLayout from '../components/shop/common-layout';
import { Container, Row, Col } from 'reactstrap';
import LocaleLink from '../components/LocaleLink';

const Page404 = () => {
    return (
        <CommonLayout parent="home" title="404">
            <section className="p-0">
                <Container>
                    <Row>
                        <Col sm="12">
                            <div className="error-section">
                                <h1>404</h1>
                                <h2>page not found</h2>
                                <LocaleLink href="/" className="btn btn-solid">back to home</LocaleLink>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </CommonLayout>
    )
}
export default Page404;