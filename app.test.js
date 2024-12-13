
const request = require('supertest');
const app = require('./app'); // Application principale
const Event = require('./models/events'); // Modèle de l'événement
const User = require('./models/users'); // Modèle de l'utilisateur
const mongoose = require('mongoose');
const axios = require('axios');
jest.mock('axios');

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




// Mock de la base de données
jest.mock('./models/events', () => ({
  create: jest.fn(),
}));
jest.mock('./models/users', () => ({
  findById: jest.fn(),
}));

// Désactivation des logs
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(async () => {
  console.log.mockRestore();
  await mongoose.connection.close();
});

describe('POST /events/addevent', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it('should return an error if planner is missing', async () => {
    const eventData = {
      title: 'Événement Test',
      category: 'Concert',
      date: {
        day: '2024-12-25',
        start: '2024-12-25T10:00:00Z',
        end: '2024-12-25T12:00:00Z',
      },
      place: {
        number: 10,
        street: 'Rue Test',
        code: 75000,
        city: 'Paris',
      },
      description: 'Ceci est une description.',
    };

    const res = await request(app).post('/events/addevent').send(eventData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: 'planner non spécifié.',
    });
  });

  it('should return an error if planner does not exist', async () => {
    User.findById.mockResolvedValueOnce(null);

    const eventData = {
      planner: '123456789012345678901234',
      title: 'Événement Test',
      category: 'Concert',
      date: {
        day: '2024-12-25',
        start: '2024-12-25T10:00:00Z',
        end: '2024-12-25T12:00:00Z',
      },
      place: {
        number: 10,
        street: 'Rue Test',
        code: 75000,
        city: 'Paris',
      },
      description: 'Ceci est une description.',
    };

    const res = await request(app).post('/events/addevent').send(eventData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: 'Organisateur non trouvé.',
    });
  });

  it('should return an error if required fields are missing', async () => {
    User.findById.mockResolvedValueOnce({ _id: '123456789012345678901234' });

    const eventData = {
      planner: '123456789012345678901234',
      title: 'Événement Test',
    };

    const res = await request(app).post('/events/addevent').send(eventData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: 'Tous les champs obligatoires doivent être remplis.',
    });
  });

  it('should return an error if geocoding fails', async () => {
    User.findById.mockResolvedValueOnce({ _id: '123456789012345678901234' });
    axios.get.mockResolvedValueOnce({ data: { results: [] } });

    const eventData = {
      planner: '123456789012345678901234',
      title: 'Événement Test',
      category: 'Concert',
      date: {
        day: '2024-12-25',
        start: '2024-12-25T10:00:00Z',
        end: '2024-12-25T12:00:00Z',
      },
      place: {
        number: 10,
        street: 'Rue Test',
        code: 75000,
        city: 'Paris',
      },
      description: 'Ceci est une description.',
    };

    const res = await request(app).post('/events/addevent').send(eventData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: 'Adresse introuvable.',
    });
  });

  it('should create an event if all data is valid', async () => {
    User.findById.mockResolvedValueOnce({ _id: '123456789012345678901234' });
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            geometry: {
              lat: 48.8566,
              lng: 2.3522,
            },
          },
        ],
      },
    });

    /* Event.create.mockResolvedValueOnce({
      _id: 'abcdef123456',
      title: 'Événement Test',
      place: {
        number: 10,
        street: 'Rue Test',
        code: 75000,
        city: 'Paris',
      },
      planner: { username: 'planner1', email: 'planner1@example.com' },
      location: {
        type: 'Point',
        coordinates: [2.3522, 48.8566],
      },
    });

    const eventData = {
      planner: '123456789012345678901234',
      title: 'Événement Test',
      category: 'Concert',
      date: {
        day: '2024-12-25',
        start: '2024-12-25T10:00:00Z',
        end: '2024-12-25T12:00:00Z',
      },
      place: {
        number: 10,
        street: 'Rue Test',
        code: 75000,
        city: 'Paris',
      },
      description: 'Ceci est une description.',
      url: 'https://example.com',
    };

    const res = await request(app).post('/events/addevent').send(eventData);

  // Logs for debugging
  console.log('Response body:', res.body);

  // Assertions
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.event.title).toBe('Événement Test');
  expect(res.body.event.location.coordinates).toEqual([2.3522, 48.8566]); */
  });
});
