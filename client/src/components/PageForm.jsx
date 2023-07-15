import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Col, Row, Button, Container, Form, FormGroup, FormLabel, Stack, Image, DropdownButton, Dropdown, ButtonGroup, Alert } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import NavHeader from "./Navbar"
import API from '../API';




function FormRoute(props) {
    return (
        <>
            <NavHeader user={props.user} logout={props.logout} frontOffice={props.frontOffice} switchOffice={props.switchOffice} />
            <Container fluid>
                <PageForm pageList={props.pageList} user={props.user}
                    addPage={props.addPage} editPage={props.editPage} />
            </Container>
        </>
    );
}


function ContentForm(props) {
    const element = props.content

    const handleType = (ev) => {
        const value = ev.target.value;
        props.setContentList(oldList => {
            const list = oldList.map((content) => {
                if (content.id === element.id) {
                    return Object.assign({}, content, { type: value, content: "" });
                } else {
                    return content;
                }
            });
            return list;
        })
    }

    const handleContent = (ev) => {
        const value = ev.target.value;
        props.setContentList(oldList => {
            const list = oldList.map((content) => {
                if (content.id === element.id) {
                    return Object.assign({}, content, { content: value });
                } else {
                    return content;
                }
            });
            return list;
        })
    }

    const handleImageContent = (eventKey) => {
        const value = eventKey;
        props.setContentList(oldList => {
            const list = oldList.map((content) => {
                if (content.id === element.id) {
                    return Object.assign({}, content, { content: value });
                } else {
                    return content;
                }
            });
            return list;
        })
    }


    function moveContent(moviment) {
        const newPosition = element.position + moviment;
        if (newPosition < 0 || newPosition === props.contentList.length) return;
        const oldPosition = element.position
        props.setContentList(oldList => {
            const list = oldList.map((content) => {
                if (content.position === oldPosition) {
                    return Object.assign({}, content, { position: newPosition });
                } else if ((content.position === newPosition)) {
                    return Object.assign({}, content, { position: oldPosition });
                } else {
                    return content;
                }
            });
            return list;
        })
    }

    const deleteContent = (id) => {
        props.setContentList(oldList=> {
            return oldList.filter((content) => content.id !== id)
        })
    }




    return (
        <Container>
            <Row className="mb-3">
                <Stack direction="horizontal" gap={2}>
                    <FormGroup as={Col}>
                        <FormLabel>Type of Content</FormLabel>
                        <Form.Select aria-label="Default select example" name="type" value={element.type} onChange={handleType}>
                            <option value="">Open this select menu</option>
                            <option value="header">Header</option>
                            <option value="image">Image</option>
                            <option value="paragraph">Paragraph</option>
                        </Form.Select>
                    </FormGroup>
                    <ButtonGroup vertical>
                        <Button onClick={() => moveContent(-1)}><i className="bi bi-caret-up"></i></Button>
                        <Button onClick={() => moveContent(1)}><i className="bi bi-caret-down"></i></Button>
                        <Button variant='danger' onClick={() => deleteContent(element.id)}><i className="bi bi-x"></i></Button>
                    </ButtonGroup>
                </Stack>
            </Row>
            {element.type === 'header' ? <>
                <FormGroup as={Row}>
                    <FormLabel>Text</FormLabel>
                    <Form.Control type="text" name="content" value={element.content} onChange={handleContent} />
                </FormGroup> </>
                : element.type === 'image' ? <>
                    <FormGroup as={Row}>
                        <FormLabel>Image</FormLabel>
                        <DropdownButton variant="secondary" id="dropdown-item-button" title={element.content ? element.content : 'Select Image' } onSelect={handleImageContent}>
                            <Row>
                                <Col sm>
                                    <Dropdown.Item eventKey="Mountain.jpg"><Image src="http://localhost:3001/static/Mountain.jpg" thumbnail /></Dropdown.Item>
                                </Col>
                                <Col sm>
                                    <Dropdown.Item eventKey="Aurora.jpg"><Image src="http://localhost:3001/static/Aurora.jpg" thumbnail /></Dropdown.Item>
                                </Col>
                                <Col sm>
                                    <Dropdown.Item eventKey="Forest.jpg"><Image src="http://localhost:3001/static/Forest.jpg" thumbnail /></Dropdown.Item>
                                </Col>
                                <Col sm>
                                    <Dropdown.Item eventKey="Desert.jpg"><Image src="http://localhost:3001/static/Desert.jpg" thumbnail /></Dropdown.Item>
                                </Col>
                            </Row>
                        </DropdownButton>
                    </FormGroup>
                </>
                    : element.type === 'paragraph' ? <>
                        <FormGroup as={Row}>
                            <FormLabel>Text</FormLabel>
                            <Form.Control type="text" as="textarea" rows={3} value={element.content} onChange={handleContent} />
                        </FormGroup>
                    </> : null
            }
        </Container>
    );
}




function PageForm(props) {

    const { pageId } = useParams();
    const pageToEdit = pageId && props.pageList.find(e => e.id === parseInt(pageId));
    const role = props.user && props.user.role


    const navigate = useNavigate();

    const [title, setTitle] = useState(pageToEdit ? pageToEdit.title : '');
    const [publicationDate, setPublicationDate] = useState(pageToEdit ? pageToEdit.publicationDate ? pageToEdit.publicationDate.format('YYYY-MM-DD') : '' : '');
    const [authorId, setAuthorId] = useState(pageToEdit ? pageToEdit.authorId : '')
    const [contentList, setContentList] = useState([{ id: 0, type: "header", content: "", position: 0 }]);
    const [authors, setAuthors] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');
    const [disableForm, setDisableForm] = useState(pageToEdit ? pageToEdit.publicationDate ? false : true : true);

    function handleErrorForm(err) {
        let errMsg = 'Unkwnown error';
        if (err.errors) {
          if (err.errors[0])
            if (err.errors[0].msg)
              errMsg = err.errors[0].msg;
        } else if (err.error) {
          errMsg = err.error;
        }
    
        setErrorMsg(errMsg);
        setTimeout(() => setDirty(true), 2000);
      }
    
    
    useEffect(() => {
        if (pageId) {
            API.getContentsByPageId(pageId)
                .then(contents => setContentList(contents))
                .catch(err => handleErrorForm(err));
        }
        if (role === 'admin') {
            API.getAllAuthors()
                .then(users => setAuthors(users))
                .catch(err => handleErrorForm(err));
        }
    }, []);


    function handleSubmit(event) {
        event.preventDefault();
        if(title.trim() === '') setErrorMsg('Title must not be a empty string.')
        else if(role === 'admin' && authorId === '') setErrorMsg('Author must be present.')
        else if(contentList.length < 2) setErrorMsg('Page must have at least two contents.')
        else if(!contentList.some(e => e.type === 'header')) setErrorMsg('Page must have at least one header.')
        else if(!contentList.some(e => e.type === 'image' || e.type === 'paragraph')) setErrorMsg('Page must have at least one image or one paragraph.')
        else if(contentList.some(e => e.type === '')) setErrorMsg('Type of content must be an header an image or a paragraph.')
        else if(contentList.some(e => e.content === '')) setErrorMsg('Contents cannot be empty')
        else {const e = {
            title: title,
            createdDate: dayjs(),
            publicationDate: disableForm ? null : dayjs(publicationDate),
            authorId: role === 'admin' ? authorId : null,
            contents: contentList
        }
        if (pageToEdit) {
            e.id = pageToEdit.id;
            props.editPage(e);
        } else {
            props.addPage(e);
        }
        navigate('/');
    }
    }

    const disablePublication = () => {
        setDisableForm((e) => !e);
    }

    const newContent = () => {
        const value = { type: "", content: "" }
        setContentList((oldList) => {
            const newPosition = Math.max(...oldList.map((e) => e.position)) + 1;
            const tempId = Math.max(...oldList.map((e) => e.id)) + 1;
            value.position = newPosition;
            value.id = tempId;
            return [...oldList, value];
        })
    }


    return (
        <>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : null}
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" name="title" value={title} onChange={ev => setTitle(ev.target.value)} />
                    </Form.Group>
                    {role === 'admin' ? <>
                        <FormGroup as={Col}>
                            <FormLabel>Author</FormLabel>
                            <Form.Select aria-label="Default select example" name="authorId" value={authorId} onChange={(ev)=> setAuthorId(ev.target.value)}>
                            <option value="">Open this select menu</option>
                                {authors.map((author) => 
                                    <option key={author.authorId} value={author.authorId}>{`${author.author}-(${author.username})`}</option>
                                )}
                            </Form.Select>
                        </FormGroup> </> : null}
                    <Form.Group as={Col}>
                        <Stack direction="horizontal" gap={1}>
                            <Form.Label as={Col}>Publication Date</Form.Label>
                            <Form.Check type="switch" id="custom-switch" onClick={disablePublication} label="Enable" />
                        </Stack>
                        <Form.Control type="date" name="publicationDate" value={publicationDate} onChange={ev => setPublicationDate(ev.target.value)} disabled={disableForm} />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    {contentList.sort((a, b) => a.position - b.position).map((content) =>
                        <ContentForm content={content} key={content.id} setContentList={setContentList} contentList={contentList} />
                    )}
                </Row>
                <Row className="mb-3" ><Button variant="secondary" size="lg" onClick={newContent}>New Content</Button></Row>
                <Row className="mb-3" ><Button type="submit" variant="primary">{pageToEdit? 'Save' : 'Add'}</Button></Row>
                <Row className="mb-3" ><Button className='mx-2' variant="danger" onClick={() => navigate('/')}>Cancel</Button></Row>
            </Form>
        </>
    );
}

export default FormRoute;