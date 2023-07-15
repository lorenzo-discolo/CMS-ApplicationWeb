import { Container, Row, Col, Spinner, Alert,Button} from 'react-bootstrap';
import NavHeader from './Navbar';
import {Pages} from './PagesComponents';


function OfficeRoute(props) {


    return (
        <>
         <NavHeader user={props.user} logout={props.logout} switchOffice={props.switchOffice} frontOffice={props.frontOffice} />
         <Container fluid>
         {props.errorMsg? <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}>
            {props.errorMsg}</Alert> : null}
            <Pages pageList={props.pageList} user={props.user} frontOffice={props.frontOffice} deletePage={props.deletePage}/>
         </Container>
        </>
    );
}

export default OfficeRoute