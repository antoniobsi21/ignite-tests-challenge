import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { app } from "../../../../app";

import createConnection from '../../../../database/index'

import { getConnection, Connection } from "typeorm"

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();
    const id = uuid();
    const password = await hash("admin", 8);
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at) 
      values('${id}', 'admin', 'admin@rentx.com.br', '${password}', 'now()')
      `
    );
    console.log(await getConnection())
  });

  afterAll(async () => {
    await connection.close();
  })


  it('should be able to get balance if authenticated', () => {

  });



});
