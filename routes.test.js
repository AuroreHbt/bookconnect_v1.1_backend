// module supertest pour tester le backend
const request = require('supertest');

// Application principale
const app = require('./app');


// générer un username random
function generateRandomUsername() {
  return Math.random().toString(15)
}

// générer un email random
function generateRandomEmail() {
  const username = Math.random().toString(36).substring(2, 10);
  return `${username}@example.com`;
}

// générer un mdp aléatoire
function generateRandomPassword() {
  return Math.random().toString(36).substring(2, 15);
}

// générer un user fictif random
const username = generateRandomUsername();
const email = generateRandomEmail();
const password = generateRandomPassword();
const user = {
  username,
  email,
  password
}

// tests

it('GET /stories/mypublishedstory/:author', async () => {
  const res = await request(app).get(`/stories/mypublishedstory/${username}`);
  expect(res.statusCode).toBe(200);
});


it('POST /users/signup', async () => {
  const res = await request(app).post('/users/signup').send({
    username,
    email,
    password
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});


it('POST /users/signin', async () => {
  const res = await request(app).post('/users/signin').send({
    email,
    password
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});


it('POST /stories/addstory', async () => {
  const res = await request(app).post('/stories/addstory').send({
    storyId,
    author: username,
    title,
    isAdult,
    category,
    description,
    // coverImage,
    // storyFile,
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});


it('DELETE /stories/deletepublishedstory/:author/:storyId', async () => {
  const res = await request(app).get(`/stories/mypublishedstory/${username}/${story._Id}`);
  expect(res.statusCode).toBe(200);
});



