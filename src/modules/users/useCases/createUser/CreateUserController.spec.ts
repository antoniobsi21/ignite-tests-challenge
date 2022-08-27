import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database/index'

let connection: Connection;
describe('Create User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection('localhost');
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.close()
  });

  it('should be able to create a user', async () => {
    const createUserResponse = await request(app).post('/api/v1/users').send(
      {
        email: 'antonio.fernandes.bsi@gmail.com',
        name: 'Antonio',
        password: '123'
      }
    );
    
    expect(createUserResponse.status).toEqual(201);

    // Maybe try to login?
  });

  it('should not be able to create a user if email already takne', async () => {
    const createUserResponse = await request(app).post('/api/v1/users').send(
      {
        email: 'antonio.fernandes.bsi@gmail.com',
        name: 'Antonio',
        password: '123'
      }
    );
    
    expect(createUserResponse.status).toEqual(400);
    expect(createUserResponse.body).toHaveProperty('message');
    expect(createUserResponse.body.message).toEqual('User already exists');
    // Maybe try to login?
  });

});