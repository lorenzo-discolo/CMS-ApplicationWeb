import 'bootstrap-icons/font/bootstrap-icons.css';
import { Col, Row, Table, Button} from 'react-bootstrap'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';



function PageRow(props) {
    const navigate = useNavigate();
    const { e } = props;
    const userId = props.user && props.user.id;
    const role = props.user && props.user.role;
    const disableButtons = role !== 'admin' && e.authorId !== userId;

    let statusClass = null;

    switch(e.marked) {
      case 'added':
        statusClass = 'table-success';
        break;
      case 'deleted':
        statusClass = 'table-danger';
        break;
      case 'updated':
        statusClass = 'table-warning';
        break;
      default:
        break;
    }

    return (
        <tr className={statusClass}>
            <td><Button variant='link' onClick={()=>{navigate(`/pages/${e.id}`)}}>{e.title}</Button></td>
            <td>{e.createdDate.format("YYYY-MM-DD")}</td>
            <td>{e.status}</td>
            <td>{e.author}</td>
            {props.frontOffice ? null : <>
            <td><Button variant='secondary' onClick={()=> {navigate(`/edit/${e.id}`)}} disabled={disableButtons}><i className="bi bi-pencil-square" /></Button>
                <Button variant='danger' onClick={props.deletePage} disabled={disableButtons}><i className="bi bi-x-square" /></Button></td></>}
        </tr>
    );
}

function Pages(props) {
    const navigate = useNavigate();
    const tempPageList = props.frontOffice ? props.pageList.filter((e)=> e.status==='published').sort((a, b) => dayjs(a.publicationDate).isBefore(b.publicationDate)) : props.pageList
    return (
        <>
            <Row>
                <Col>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th>Author</th>
                                {props.frontOffice ? null :
                                <th><Button variant='primary' onClick={()=> navigate('/add')}><i className="bi bi-file-earmark-plus"/>Add pages</Button></th>}
                            </tr>
                        </thead>
                        <tbody >
                            {tempPageList.map((e) =>
                                <PageRow e={e} key={e.id} user={props.user} frontOffice={props.frontOffice} deletePage={()=>props.deletePage(e.id)}/>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    );
}

export { Pages, PageRow };