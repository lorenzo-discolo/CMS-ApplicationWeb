'use strict';

const express = require('express');
const morgan = require('morgan');
const { body, param, validationResult } = require('express-validator');
const dao = require('./dao');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const userDao = require('./user-dao');
const cors = require('cors');


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});


// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

/*** Init express ***/
const app = new express();
const port = 3001;

/** Set-up the middlewares **/
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use('/static', express.static('public')); // middleware Static for images

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

/** Set up the session **/
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'bfoeb8rvbwe0ge90xu',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

/** Then, init passport **/
app.use(passport.initialize());
app.use(passport.session());

/*** Validation ***/

function PageValidation() {
  return [
    body('title')
      .exists().withMessage('Tile must be present.').bail()
      .notEmpty().withMessage('Title must not be a empty string.').bail()
      .isString().withMessage('Title must be a string.').bail(),
    body('createdDate')
      .exists().withMessage('CreationDate must be present.').bail()
      .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('CreationDate must be a date in the format YYYY-MM-DD').bail(),
    body('publicationDate')
      .optional({ values: 'null' })
      .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('publicationDate must be a date in the format YYYY-MM-DD').bail(),
    body('authorId')
      .exists().withMessage('Author must be present.').bail()
      .custom(async value => {
        const existingUser = await userDao.findUserById(value);
        if (!existingUser) {
          throw new Error('Must be a valid Author.');
        }
        return true;
      })
      .optional({ values: 'null' }),
    body('contents')
      .exists().withMessage('Page must have contents.').bail()
      .isArray({ min: 2 }).withMessage('Page must have at least two contents.').bail()
      .custom((value) => {
        if (!value.some(e => e.type === 'header')) {
          throw new Error('Page must have at least one header.');
        }
        if (!value.some(e => e.type === 'image' || e.type === 'paragraph')) {
          throw new Error('Page must have at least one image or one paragraph.');
        }
        return true;
      }).bail(),
    body('contents.*.type')
      .exists().withMessage('Type of content must be present.').bail()
      .isString().withMessage('Type of content must be a string.').bail()
      .isIn(['header', 'image', 'paragraph']).withMessage('Type of content must be an header an image or a paragraph.').bail(),
    body('contents.*.content')
      .exists().withMessage('Content of element must be present.').bail()
      .isString().withMessage('Content of element must be a string.').bail()
      .notEmpty().withMessage('Contents cannot be empty.').bail(),
    body('contents.*.position')
      .exists().withMessage('Position of element must be present.').bail()
      .isInt({ min: 0 }).withMessage('Position od element must be at least 0.').bail(),
  ]
}

function ValidationSiteName(){
  return [
    body('nameSite')
    .exists().withMessage('Site name must be present.').bail()
    .notEmpty().withMessage('Site name must not be a empty string.').bail()
    .isString().withMessage('Site name must be a string.').bail(),
  ]
}


/*** Site API***/

//GET /api/siteName
app.get('/api/siteName', (req, res) => {
  dao.getSiteName()
    .then(siteName => res.json(siteName))
    .catch(err => res.status(500).json(err));
});

//GET /api/pages
app.get('/api/pages', (req, res) => {
  dao.listPages()
    .then(pages => res.json(pages))
    .catch(err => res.status(500).json(err));
});

//GET /api/pages/<id>
app.get('/api/pages/:id', (req, res) => {
  dao.getPage(req.params.id)
    .then(page => {
      if (page.error) res.status(404).json(page);
      else res.json(page);
    })
    .catch(err => res.status(500).json(err));
});


//GET /api/pages/<id>/contents
app.get('/api/pages/:id/contents', async (req, res) => {
  try {
    const resultPage = await dao.getPage(req.params.id);
    if (resultPage.error) {
      res.status(404).json(resultPage);
    }
    else {
      const resultContents = await dao.listContentsByPage(req.params.id);
      if (resultContents.error) res.status(404).json(resultContents);
      else res.json(resultContents);
    }
  }
  catch (err) {
    res.status(500).json(err);
  }
});


//POST /api/pages
app.post('/api/pages', isLoggedIn, PageValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const page = {
    title: req.body.title,
    createdDate: req.body.createdDate,
    publicationDate: req.body.publicationDate,
    authorId: req.user.role === 'admin' ? req.body.authorId : req.user.id
  };

  try {
    const pageId = await dao.createPage(page);
    const contentsId = await Promise.all(req.body.contents.map(content=> {
      const newContent = {
      type: content.type,
      content: content.content,
      position: content.position,
      pageId: pageId
    };
    return dao.createContent(newContent);
  }))
    res.status(201).json({ message: "Creation success" });
  } catch (err) {
    res.status(503).json({ error: 'Database error during the creation of page and its contents.' })
  }
});


//PUT /api/pages/<id>
app.put('/api/pages/:id', isLoggedIn, [PageValidation(),param('id').isInt().withMessage('Id must be an Int.').bail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const page = {
    title: req.body.title,
    publicationDate: req.body.publicationDate,
    authorId: req.user.role === 'admin' ? req.body.authorId : req.user.id
  }
  if (req.body.id !== parseInt(req.params.id)) {
    return res.status(422).json({ error: 'Page id must be the same as the one specified in the URL.' })
  }
  page.id = req.params.id;

  try {
    const numRowChanges = await dao.updatePage(page, req.user.id);
    if (!numRowChanges) return res.status(403).json({ error: 'Must be the author of the page to edit it.' });
    await dao.deleteContentsBypageId(page.id, req.user.id);
    await Promise.all(req.body.contents.map(content=> {
      const newContent = {
      type: content.type,
      content: content.content,
      position: content.position,
      pageId: page.id
    };
    return dao.createContent(newContent);
  }));
    res.status(200).json({ message: "Update success" });
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of page ${req.params.id}.` });
  }
});

//PUT /api/siteName
app.put('/api/siteName', isLoggedIn, ValidationSiteName(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const siteName = req.body.nameSite;
  try {
    const numRowChanges = await dao.updateNameSite(siteName, req.user.id);
    if(!numRowChanges) return res.status(403).json({ error: 'Must be the admin to change the name of the site.' });
    res.status(200).json({ message: "Update success" });
  } catch (err) {
    res.status(503).json({ error: 'Database error during the update of site name' });
  }
})

//DELETE /api/pages/<id>
app.delete('/api/pages/:id', isLoggedIn, [param('id').isInt().withMessage('Id must be an Int.').bail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const numRowChanges = await dao.deletePage(req.params.id, req.user.id);
      if(!numRowChanges) return res.status(403).json({ error: 'Must be the author of the page to delete it.' });
      await dao.deleteContentsBypageId(req.params.id, req.user.id);
      res.status(204).json({ message: "Delete success" });
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.` });
    }
  })


/*** Users API ***/

//GET /api/authors
app.get('/api/authors', (req, res) => {
  userDao.getAllUsers(req.user.id)
    .then(authors => {
      if(!authors) return res.status(403).json({ error: 'Must be the admin to get all authors information.' });
      else res.json(authors);
    })
    .catch(err => res.status(500).json(err)
  );
});

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

/*** Other express-related instructions ***/

/** Activate the server **/
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
