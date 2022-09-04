import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { app } from "../../../../app";

import createConnection from '../../../../database/index'

import { Connection } from "typeorm"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.dropDatabase();
    await connection.runMigrations();
    const id = uuid();
    const password = await hash("admin", 8);
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at) 
      values('${id}', 'admin', 'admin@rentx.com.br', '${password}', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.close();
  })


  it('should be able to get profile if authenticated', async () => {
    const loginResponse = await request(app).post('/api/v1/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin'
    });
    const { token } = loginResponse.body;
    const profileResponse = await request(app).get('/api/v1/profile').send().set({
      Authorization: `Bearer ${token}`
    });

    expect(profileResponse.body).toHaveProperty('id');

    expect(profileResponse.body).toHaveProperty('name');
    expect(profileResponse.body.name).toEqual('admin');
    expect(profileResponse.body).toHaveProperty('email');
    expect(profileResponse.body.email).toEqual('admin@rentx.com.br');

  });

});
