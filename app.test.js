const request = require('supertest');
const app = require('./app');

it('POST /users/signin', async () => {
  const res = await request(app).post('/users/signin').send({
      email: 'eli@gmail.com',
      password: '@123456Aa',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});


it('DELETE /events/deleteevent', async () => {
  const res = await request(app).delete('/events/deleteevent').send({
      token: 'pSm4fN7yhho2ZIWygsiU0Wrux9pAJpQM',
      eventId: '675c33daa30da509016a4c73',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});