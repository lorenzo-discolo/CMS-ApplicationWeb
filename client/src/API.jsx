/*** API calls ***/

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

function pageStatus(date) {
    if (dayjs(date).isBefore(dayjs())) return 'published'
    if (dayjs(date).isAfter(dayjs())) return 'scheduled'
    else return 'draft'
}

async function getSiteName() {
    // call /api/siteName
    const response = await fetch(URL + '/siteName');
    const siteName = await response.json();
    if (response.ok) return siteName;
    else throw siteName
}


async function getAllPages() {
    // call /api/pages
    const response = await fetch(URL + '/pages');
    const pages = await response.json();
    if (response.ok) {
        return pages.map((page) => ({
            id: page.id,
            title: page.title,
            createdDate: dayjs(page.createdDate),
            publicationDate: page.publicationDate ? dayjs(page.publicationDate) : null,
            status: pageStatus(page.publicationDate),
            author: page.author,
            authorId: page.authorId
        }))
    } else {
        throw pages;
    }
}

async function getPage(id) {
    //call /api/pages/<id>
    const response = await fetch(URL + `/pages/${id}`);
    const element = await response.json();
    if (response.ok) {
        const page = element;
        return {
            id: page.id,
            title: page.title,
            createdDate: dayjs(page.createdDate),
            publicationDate: page.publicationDate ? dayjs(page.publicationDate) : null,
            status: pageStatus(page.publicationDate),
            author: page.author,
            authorId: page.authorId
        }
    } else {
        throw element;
    }
}

async function getContentsByPageId(pageId) {
    // call /api/pages/<id>/contents
    const response = await fetch(URL + `/pages/${pageId}/contents`);
    const contents = await response.json();
    if (response.ok) {
        return contents.map((content) => ({
            id: content.id,
            type: content.type,
            content: content.content,
            position: content.position,
            pageId: content.pageId
        }))
    } else {
        throw contents;
    }
}

function addPageWithContents(pageWithContents) {
    // call POST /api/pages
    return new Promise((resolve, reject) => {
        fetch(URL + `/pages`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.assign({}, pageWithContents, { createdDate: pageWithContents.createdDate.format("YYYY-MM-DD"), publicationDate: pageWithContents.publicationDate ? pageWithContents.publicationDate.format("YYYY-MM-DD") : null })),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((id) => resolve(id))
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            } else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

function updatePagewithContents(editedPageWithContents) {
    //call PUT /api/pages/<id>
    return new Promise((resolve, reject) => {
        fetch(URL + `/pages/${editedPageWithContents.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.assign({}, editedPageWithContents, { createdDate: editedPageWithContents.createdDate.format("YYYY-MM-DD"), publicationDate: editedPageWithContents.publicationDate ? editedPageWithContents.publicationDate.format("YYYY-MM-DD") : null })),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
};

function updateSiteName(newName) {
    // call PUT /api/siteName
    return new Promise((resolve, reject) => {
        fetch(URL + '/siteName', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nameSite: newName}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
};

function deletePagewithContents(id) {
    // call DELETE /api/pages/<id>
    return new Promise((resolve, reject) => {
        fetch(URL + `/pages/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

/*** Access APIs ***/

async function logIn(credentials) {
    let response = await fetch(URL + '/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail;
    }
}

async function logOut() {
    await fetch(URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
}

/*** User APIs ***/

async function getUserInfo() {
    const response = await fetch(URL + '/sessions/current', {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;
    }
}

async function getAllAuthors() {
    const response = await fetch(URL + '/authors', {
        credentials: 'include'
    });
    const authors = await response.json();
    if (response.ok) {
        return authors.map((e) => ({ authorId: e.authorId, username: e.username, author: e.author }))
    } else {
        throw authors;
    }
}

const API = {
    getAllPages, getPage, getContentsByPageId, addPageWithContents, updatePagewithContents,
    deletePagewithContents, logIn, logOut, getUserInfo, getAllAuthors, getSiteName, updateSiteName
}
export default API;