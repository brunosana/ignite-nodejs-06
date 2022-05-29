import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/";
import { v4 as uuid} from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe('GetBalance Controller', () => {

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

  test('should return 200 and balance array', async () => {

    const responseAuth = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'admin@admin.com',
      password: 'admin'
    });

    const { token } = responseAuth.body;

     await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({
      amount: 50,
      description: 'Pix transfer'
    });

    const response = await request(app)
    .get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${token}`,
    });

    const { body } = response;

    expect(response.statusCode).toBe(200);
    expect(body.statement).toBeDefined();
    expect(body.statement.length).toBe(1);
    expect(body.balance).toBe(50);
  });
});
