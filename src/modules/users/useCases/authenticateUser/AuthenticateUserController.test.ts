import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/";
import { v4 as uuid} from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe('AuthenticateUser Controller', () => {

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

  test('should return 200 and token on create a session', async () => {

    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'admin@admin.com',
      password: 'admin'
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
