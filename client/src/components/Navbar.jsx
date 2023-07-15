import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Button, Nav, Stack, Badge, Col, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import API from '../API';

function SwitchView(props) {
    const navigate = useNavigate();
    const role = props.user && props.user.role;

    const handleSelect = (eventKey) => {
        props.switchOffice(Boolean(eventKey))
        navigate('/');
    };


    return (
        <Navbar.Collapse className={role === 'admin' && !props.edit ? "justify-content-between" : "justify-content-center"}>
            <Nav variant="underline" className="justify-content-center" defaultActiveKey={props.frontOffice ? "true" : ""} onSelect={handleSelect}>
                <Nav.Item>
                    <Nav.Link eventKey="true">Front Office</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="">Back Office</Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar.Collapse>
    );
}

function NavHeader(props) {
    const navigate = useNavigate();
    const [siteName, setSiteName] = useState('');
    const [dirty, setDirty] = useState(true);
    const [edit, setEdit] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const name = props.user && props.user.name;
    const role = props.user && props.user.role;

    function handleErrorNav(err) {
        let errMsg = 'Unkwnown error';
        if (err.errors) {
            if (err.errors[0])
                if (err.errors[0].msg)
                    errMsg = err.errors[0].msg;
        } else if (err.error) {
            errMsg = err.error;
        }

        setErrorMsg(errMsg);
        setDirty(true);
    }

    useEffect(() => {
        if (dirty) {
            API.getSiteName()
                .then((newName) => {
                    setSiteName(newName);
                    setDirty(false);
                })
                .catch((err) => handleErrorNav(err));
        }
    }, [dirty])

    const updateSiteName = (newName) => {
        API.updateSiteName(newName)
            .then(() => setDirty(true))
            .catch((err) => handleErrorNav(err));
    }


    function handleSubmit(event) {
        event.preventDefault();
        if(siteName === '') setErrorMsg('Site name must not be a empty string.');
        else {
        updateSiteName(siteName);
        setEdit(false)
        }
    }



    return (
        <Navbar bg='dark' variant='dark'>
            <Container className="mb-" fluid>
                {edit ?
                        <Form onSubmit={handleSubmit}>
                        <Stack direction="horizontal" gap={2}>    
                       <Form.Control type="text" value={siteName} onChange={ev => setSiteName(ev.target.value)} />
                       <Button type='submit' ><i className="bi bi-check-square"></i></Button>
                       <Button variant='danger' onClick={() => { setDirty(true); setEdit(false) }}><i className="bi bi-x-square"></i></Button>
                       </Stack>
                   </Form>
                    :
                    <Navbar.Brand className='fs-2'>{siteName}</Navbar.Brand>}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {role === 'admin' && !edit ?
                    <Navbar.Collapse className="justify-content-start">
                        <Button onClick={() => setEdit(true)}><i className="bi bi-pencil"></i></Button>
                    </Navbar.Collapse> : null
                }
                {errorMsg ? <Alert variant='danger' dismissible className='my-2' onClose={() => setErrorMsg('')}>
                    {errorMsg}</Alert> : null}
                <Navbar.Collapse className="justify-content-end">
                    {name ? <>
                        <SwitchView switchOffice={props.switchOffice} frontOffice={props.frontOffice} user={props.user} edit={edit}/>
                        <Navbar.Text className='fs-'>
                            <Stack direction="vertical" gap={1}>
                                {"Benvenuto " + name}
                                {role === 'admin' ? <Badge pill bg="primary">Admin</Badge> : null}
                            </Stack>
                        </Navbar.Text>
                        <Button className="mx-2" variant='danger' onClick={props.logout}>Logout</Button>
                    </> :
                        <Button className='mx-2' variant='warning' onClick={() => navigate('/login')}>Login</Button>}
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
}

export default NavHeader;