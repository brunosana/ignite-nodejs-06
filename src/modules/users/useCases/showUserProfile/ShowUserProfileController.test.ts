import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/";
import { v4 as uuid} from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
const id = uuid();

describe('ShowUserProfile Controller', () => {

  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();

    const password = await hash('admin', 8);
    await connection.query(`DELETE FROM users`);
    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@admin.com', '${password}', 'now()', 'now()')`);
  });

  afterAll(async () => {
    await connection.close();
  });

  test('should return 200 and return user info', async () => {

    const responseAuth = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'admin@admin.com',
      password: 'admin'
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`,
    });



    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.password).toBeUndefined();
  });
});
