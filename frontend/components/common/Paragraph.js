import React from 'react';
import { Container, Row, Col } from 'reactstrap';

const Paragraph = ({title, inner, line ,hrClass}) => {
    return (
        <>
            <div className={title}>
                <h4>Specialerbjudande</h4>
                <h2 className={inner}>toppsamling</h2>
                {
                    line ?
                        <div className="line"></div> : 
                    hrClass ?
                        <hr role="tournament6"></hr>
                    : ''
                }
            </div>
            <Container>
                <Row>
                    <Col lg="6" className="m-auto">
                        <div className="product-para">
                            <p className="text-center">Upptäck vårt specialerbjudande på vår toppsamling! Begränsad tid, exklusiva rabatter på utvalda produkter. Missa inte chansen att förnya din stil med våra premiumartiklar. Handla nu och spara stort!</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default Paragraph;