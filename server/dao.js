'use strict'
/* Data access Object (DAO) module for accessing pages and their contents*/

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

//open the database
const db = new sqlite.Database('exam_db.sqlite', (err) => {
    if (err) throw err;
});

/*** GET ***/

//get site name
exports.getSiteName = () => {
    return new Promise((resolve,reject) => {
        const sql = 'SELECT text AS siteName FROM site WHERE id = 1'
        db.get(sql, [], (err,row) => {
            if(err) {
                reject(err);
                return;
            }
            if(row === undefined){
                resolve({error: 'Site name not found.'});
            }else {
                resolve(row.siteName);
            }
        });
    });
};


//get all pages
exports.listPages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT pages.id,title,createdDate,publicationDate,name AS author, users.id AS authorId FROM pages JOIN users ON pages.authorId = users.id';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((page) => ({
                id: page.id,
                title: page.title,
                createdDate: dayjs(page.createdDate),
                publicationDate: dayjs(page.publicationDate),
                author: page.author,
                authorId: page.authorId
            }));
            resolve(pages);
        });
    });
};

//get the page indentified by {id}
exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT pages.id,title,createdDate,publicationDate,name AS author, users.id AS authorId FROM pages JOIN users ON pages.authorId = users.id WHERE pages.id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                resolve({ error: 'Page not found.' });
            } else {
                const page = {
                    id: row.id,
                    title: row.title,
                    createdDate: dayjs(row.createdDate),
                    publicationDate: dayjs(row.publicationDate),
                    author: row.author,
                    authorId: row.authorId
                };
                resolve(page);
            }
        });
    });
};


//get all contents by pageId
exports.listContentsByPage = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT contents.id AS id, type, content, position, pageId FROM contents WHERE pageId = ?';
        db.all(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if(rows === undefined){
                resolve({ error: 'Page without contents.' });
            } else {
            const contents = rows.map((content) => ({
                id: content.id,
                type: content.type,
                content: content.content,
                position: content.position,
                pageId: content.pageId
            }));
            resolve(contents);
        }});
    });
};


//add a new page
exports.createPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(title,createdDate, publicationDate,authorId) VALUES(?,DATE(?),DATE(?), ?)';
        db.run(sql, [page.title, page.createdDate, page.publicationDate, page.authorId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

//add a new content
exports.createContent = (content) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO contents(type,content,position,pageId) VALUES(?,?,?,?)';
        db.run(sql, [content.type, content.content, content.position, content.pageId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        })
    })
}

//update an existing page by user o by admin
exports.updatePage = (page, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE pages SET title=?, publicationDate=DATE(?), authorId=? WHERE id = ? AND (authorId = ? OR EXISTS(SELECT * FROM users WHERE users.id = ? AND users.role="admin"))';
        db.run(sql, [page.title, page.publicationDate, page.authorId, page.id, userId, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};


//update site name by admin
exports.updateNameSite = (newName, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE site SET text=? WHERE id = 1 AND EXISTS(SELECT * FROM users WHERE users.id=? AND users.role="admin")'
        db.run(sql, [newName, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        })
    })
}


//delete an exiting page by id
exports.deletePage = (id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM pages WHERE id=? AND (authorId=? OR EXISTS(SELECT * FROM users WHERE users.id=? AND users.role="admin"))';
        db.run(sql, [id, userId, userId], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(this.changes);
            }
        });
    });
};


//delete exiting contents by pageId
exports.deleteContentsBypageId = (pageId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM contents WHERE pageId = ? AND EXISTS(SELECT * FROM pages WHERE pages.id = ? AND (authorId = ? OR EXISTS(SELECT * FROM users WHERE users.id=? AND users.role="admin")))';
        db.run(sql, [pageId, pageId, userId, userId], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(this.changes);
            }
        });
    });
};


