import {Container} from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';



function DefaultRoute() {
  return(
    <Container className='App'>
      <h1>Link inesistente</h1>
      <h2>This is not the route you are looking for!</h2>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}

export default DefaultRoute