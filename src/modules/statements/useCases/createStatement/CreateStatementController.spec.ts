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

describe('Create Statement Controller', () => {
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


  it('should be able to deposit if authenticated', async () => {
    const loginResponse = await request(app).post('/api/v1/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin'
    });
    const { token } = loginResponse.body;
    const depositResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(depositResponse.body).toHaveProperty('id');

    expect(depositResponse.body).toHaveProperty('amount');
    expect(depositResponse.body.amount).toEqual(100);
    expect(depositResponse.body).toHaveProperty('type');
    expect(depositResponse.body.type).toEqual('deposit');

  });

  it('should be able to withdraw if have enough money', async () => {
    const loginResponse = await request(app).post('/api/v1/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin'
    });
    const { token } = loginResponse.body;
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(withdrawResponse.body).toHaveProperty('id');

    expect(withdrawResponse.body).toHaveProperty('amount');
    expect(withdrawResponse.body.amount).toEqual(100);
    expect(withdrawResponse.body).toHaveProperty('type');
    expect(withdrawResponse.body.type).toEqual(OperationType.WITHDRAW);

  });

  it('should not be able to withdraw if doesnt have enought money', async () => {
    const loginResponse = await request(app).post('/api/v1/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin'
    });
    const { token } = loginResponse.body;
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 100,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 125,
      description: 'Test',
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(withdrawResponse.body).toHaveProperty('message');
    expect(withdrawResponse.body.message).toEqual('Insufficient funds');

  });

});
