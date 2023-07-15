import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Button, Row, Col, Container, Image } from 'react-bootstrap';
import NavHeader from "./Navbar";
import API from '../API';



function Content(props) {
    const element = props.content
    const imageURL = "http://localhost:3001/static/"
    switch (element.type) {
        case 'header':
            return (
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <h2>{element.content}</h2>
                    </Col>
                </Row>
            );
            break;
        case 'paragraph':
            return (
                <Row>
                    <p>{element.content}</p>
                </Row>
            );
            break;
        case 'image':
            return (
                <Row>
                    <Image src={imageURL + element.content} />
                </Row>
            );
            break;
        default:
            break;
    }
}


function Page(props) {

    const { pageId } = useParams();
    const navigate = useNavigate();
    const [docuContent, setDocuContent] = useState([])

    const document = pageId && props.pageList.find(e => e.id === parseInt(pageId))

    useEffect(() => {
            API.getContentsByPageId(pageId)
                .then((contents) => setDocuContent(contents))
                .catch((err) => console.log(err));
    }, [])


    

    return (
        <>
            <NavHeader user={props.user} logout={props.logout} switchOffice={props.switchOffice} frontOffice={props.frontOffice} />
            <Container className="mb-3">
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <h1>{document && document.title}</h1>
                    </Col>
                </Row>
                {docuContent.sort((a, b) => a.position - b.position).map((content) =>
                    <Content content={content} key={content.id} />
                )}
                <Row>
                        <Button onClick={(() => navigate('/'))}>Torna alla home</Button>
                </Row>
            </Container>
        </>

    );
}

export default Page