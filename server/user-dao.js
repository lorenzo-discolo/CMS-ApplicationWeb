'use strict'
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

//Database access
const db = new sqlite.Database('exam_db.sqlite', (err) => {
    if (err) throw err;
});

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({ error: 'User not found.' });
            else {
                const user = { id: row.id, username: row.email, name: row.name, role: row.role }
                resolve(user);
            }
        });
    });
};

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) { reject(err); }
            else if (row === undefined) { resolve(false); }
            else {
                const user = { id: row.id, username: row.email, name: row.name, role: row.role };

                const salt = row.salt;
                crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                    if (err) reject(err);

                    const passwordHex = Buffer.from(row.password, 'hex');

                    if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
                        resolve(false);
                    else resolve(user);
                });
            }
        });
    });
}; 

exports.getAllUsers = (userId) =>{
    return new Promise((resolve, reject) => {
        const sql = 'SELECT users.id AS authorId, email AS username, name AS author FROM users WHERE EXISTS(SELECT * FROM users WHERE users.id = ? AND users.role="admin")';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const authors = rows.map((e)=> ({authorId: e.authorId, username: e.username, author: e.author}));
            resolve(authors);
        });
    });
}

exports.findUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve(false);
            else {
                resolve(true);
            }
        });
    });
};