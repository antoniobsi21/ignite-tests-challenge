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

describe('Get Statement Operation Controller', () => {
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


  it('should be able to get statement operation if authenticated and statement exists', async () => {
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

    // Redundant
    expect(depositResponse.body).toHaveProperty('id');

    const statementOperationResponse = await request(app).post(`/api/v1/statements/${depositResponse.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(statementOperationResponse.body).toHaveProperty('amount');
    expect(statementOperationResponse.body.amount).toEqual(100);
    expect(statementOperationResponse.body).toHaveProperty('type');
    expect(statementOperationResponse.body.type).toEqual('deposit');

  });
});
