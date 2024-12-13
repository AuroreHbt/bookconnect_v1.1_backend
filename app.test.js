const request = require('supertest');
const app = require('./app');

it('GET /stories/mypublishedstory/:author', async () => {
    const res = await request(app).get('/stories/mypublishedstory/test47');

    expect(res.statusCode).toBe(200);
});


it('POST /users/signup', async () => {
    const res = await request(app).post('/users/signup').send({
        username: 'test1t234', // re-générer un username pour newTest
        email: 'test1t234@gmail.com', // re-générer un email pour newTest
        password: 'azer4tty123&!', // re-générer un password pour newTest
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
});

