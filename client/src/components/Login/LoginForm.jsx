import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../API"

function LoginForm(props) {
  const [username, setUsername] = useState('alighieri@test.com');
  const [password, setPassword] = useState('polito');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const usernameValidation = (username) => {
    return String(username)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    //Login Validation
    if (!usernameValidation(username)) {
      setErrorMessage('username not valid.');
    } else if (password.trim() === '') {
      setErrorMessage("password is mandatory.");
    } else {
      const credentials = { username, password };
      props.login(credentials).catch(err => {setErrorMessage(err.message)})
    }
  };

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6}>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Button className='my-2' type='submit' onClick={handleSubmit}>Log in</Button>
            <Button className='my-2 mx-2' variant='danger' onClick={() => navigate('/')}>Cancel</Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  )
}

export default LoginForm;