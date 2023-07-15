import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import DefaultRoute from './components/NotFound404/DefaultRoute'
import OfficeRoute from './components/OfficeRoute';
import LoginForm from './components/Login/LoginForm';
import FormRoute from './components/PageForm';
import Page from './components/PageRoute';
import API from './API'




function App() {
  const [pageList, setPageList] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [user, setUser] = useState(undefined);
  const [frontOffice, setFrontOffice] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  function handleError(err) {
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
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        //do nothing, person not authenticated
      }
    };
    checkAuth();
  }, []);



  useEffect(() => {
    if (dirty) {
      API.getAllPages()
        .then((pages) => {
          setPageList(pages);
          setDirty(false);
        })
        .catch((err) => handleError(err));
    }
  }, [dirty]);

  const switchOffice = (value) => {
    setFrontOffice(value);
  }

/** Access **/

  const doLogIn = async (credentials) => {
    return API.logIn(credentials)
      .then( user => {
        setUser(user);
        setLoggedIn(true);
        setDirty(true);
        setFrontOffice(false);
      })  
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setFrontOffice(true);
  }

/** content management functions **/

  const addPage = (newPage) => {
    if (user.role !== 'admin') newPage.author = user.nome;
    setPageList(oldPages => {
      const newTempId = Math.max(...oldPages.map(e => e.pageId)) + 1;
      newPage.id = newTempId;
      newPage.marked = 'added';
      return [...oldPages, newPage];
    });
    API.addPageWithContents(newPage)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }


  const editPage = (editedPage) => {
    setPageList(oldPages => oldPages.map((page) => {
      if (page.id === editedPage.id) {
        editedPage.marked = 'updated';
        return editedPage;
      } else { return page; }
    }))
    API.updatePagewithContents(editedPage)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  const deletePage = (pageId) => {
    setPageList(oldPages => oldPages.map(page =>
      page.pageId !== pageId ? page : Object.assign({}, page, { marked: 'delete' })));
    API.deletePagewithContents(pageId)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<OfficeRoute  pageList={pageList} user={user} logout={doLogOut}
          frontOffice={frontOffice} switchOffice={switchOffice} deletePage={deletePage}
          errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')}/>} />
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={doLogIn} />} />
        <Route path='/add' element={<FormRoute pageList={pageList} user={user} logout={doLogOut}
          addPage={addPage} editPage={editPage} frontOffice={frontOffice} switchOffice={switchOffice} />} />
        <Route path='/edit/:pageId' element={<FormRoute pageList={pageList} user={user} logout={doLogOut}
          addPage={addPage} editPage={editPage} switchOffice={switchOffice} frontOffice={frontOffice} />} />
        <Route path='/pages/:pageId' element={<Page pageList={pageList} user={user} logout={doLogOut} 
        switchOffice={switchOffice} frontOffice={frontOffice}/>} />
        <Route path='/*' element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App
