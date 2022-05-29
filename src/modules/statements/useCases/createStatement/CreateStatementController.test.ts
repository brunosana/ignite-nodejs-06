import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/";
import { v4 as uuid} from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe('CreateStatement Controller', () => {

  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();

    const id = uuid();
    const password = await hash('admin', 8);
    await connection.query(`DELETE FROM users`);
    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@admin.com', '${password}', 'now()', 'now()')`);
  });

  afterAll(async () => {
    await connection.close();
  });

  test('should return 201 on deposit', async () => {

    const responseAuth = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'admin@admin.com',
      password: 'admin'
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({
      amount: 50,
      description: 'Pix transfer'
    });

    const { body } = response;

    expect(body.amount).toBe(50);
    expect(body.description).toBe('Pix transfer');
    expect(response.statusCode).toBe(201);
  });


  test('should return 201 on withdraw', async () => {

    const responseAuth = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'admin@admin.com',
      password: 'admin'
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({
      amount: 50,
      description: 'Cashing'
    });

    const { body } = response;

    expect(body.amount).toBe(50);
    expect(body.description).toBe('Cashing');
    expect(response.statusCode).toBe(201);
  });

});
