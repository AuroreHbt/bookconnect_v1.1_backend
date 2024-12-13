const request = require('supertest');
const app = require('./app');

it('GET /stories/mypublishedstory/:author', async () => {
	const res = await request(app).get('/stories/mypublishedstory/test47');

	expect(res.statusCode).toBe(200);
});