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

describe('Get Balance Controller', () => {
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


  it('should be able to get balance if authenticated', async () => {
    const loginResponse = await request(app).post('/api/v1/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin'
    });
    const { token } = loginResponse.body;
    console.log(token);
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    const balanceResponse = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    console.log(balanceResponse.body);

    expect(balanceResponse.body).toHaveProperty('balance');
    expect(balanceResponse.body.balance).toBe(200);

  });



});
