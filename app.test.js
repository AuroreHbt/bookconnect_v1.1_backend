const request = require('supertest');
const app = require('./app');

it('GET /stories/mypublishedstory/:author', async () => {
    const res = await request(app).get('/stories/mypublishedstory/test47');

    expect(res.statusCode).toBe(200);
});


it('POST /users/signup', async () => {
    const res = await request(app).post('/users/signup').send({
        username: 'test1234',
        email: 'test1234@gmail.com',
        password: 'azer4ty123&!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
});

