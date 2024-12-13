const request = require('supertest');
const app = require('./app');

it('GET /stories/mypublishedstory/:author', async () => {
    const res = await request(app).get('/stories/mypublishedstory/test47');

    expect(res.statusCode).toBe(200);
});


it('POST /users/signup', async () => {
    const res = await request(app).post('/users/signup').send({
        username: 'test123', // re-générer un username pour newTest
        email: 'test123@gmail.com', // re-générer un email pour newTest
        password: 'azerty123&!', // re-générer un password pour newTest
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
});

