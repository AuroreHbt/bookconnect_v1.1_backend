// module supertest pour tester le backend
const request = require('supertest');

// Application principale
const app = require('./app');


// générer un username random
function generateRandomUsername() {
  const userTest = Math.random().toString(36).substring(2, 10)
  return `UserTest${userTest}`;
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

// générer un storyId aléatoire
function generateRandomStoryId() {
  return Math.random().toString(36).substring(7, 25);
}

// générer un titre random
function generateRandomTitle() {
  const titleNb = Math.random().toString(36).substring(5, 7);
  return `test${titleNb}`;
}

// générer une description random
function generateRandomDescription() {
  return Math.random().toString(36)
}

// générer une story fictive random
// const storyId = generateRandomStoryId();
const title = generateRandomTitle();
const description = generateRandomDescription();


// tests existence des routes (code 200 expected)

it('POST /users/signup', async () => {
  const res = await request(app).post('/users/signup')
  expect(res.statusCode).toBe(200);
});

it('POST /users/signin', async () => {
  const res = await request(app).post('/users/signin')
  expect(res.statusCode).toBe(200);
});

it('DELETE /stories/deletepublishedstory', async () => {
  const res = await request(app).delete('/stories/deletepublishedstory');
  expect(res.statusCode).toBe(200);
});


// test fonctionnalité simple des routes 

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
    author: username,
    title,
    isAdult: false || true,
    category: "Autre",
    description,
    storyFile: "Moula test.pdf",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});


it('GET /stories/mypublishedstory/:author', async () => {
  const res = await request(app).get(`/stories/mypublishedstory/${username}`);
  expect(res.statusCode).toBe(200);
});


it('GET /events/searchevent/:place', async () => {
  const res = await request(app).get('/events/searchevent/Paris');
  expect(res.statusCode).toBe(200);
});

