import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/";

let connection: Connection;

describe('CreateUser Controller', () => {

  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
    await connection.query(`DELETE FROM users`);
  });

  afterAll(async () => {
    await connection.query(`DELETE FROM users`);
    await connection.close();
  });

  test('should return 201 on create a user', async () => {
    const response = await request(app)
    .post('/api/v1/users')
    .send({
      name: 'valid-name',
      email: 'uset@user.com',
      password: 'valid-password'
    })
    expect(response.status).toBe(201);
  });
});
