import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

jest.mock('bcryptjs', () => ({
  hash: (password: string, salt: number): Promise<string> => {
    return Promise.resolve('hashed-password');
  }
}))

let usersRepository = new InMemoryUsersRepository();

interface SutTypes {
  sut: CreateUserUseCase;
}

const makeValidInput = (): ICreateUserDTO => ({
  email: 'valid-mail@mail.com',
  name: 'valid-name',
  password: 'valid-pass'
});

const makeSut = (): SutTypes => {
  const sut = new CreateUserUseCase(usersRepository);

  return {
    sut,
  }
}

describe('CreateUser UseCase', () => {

  test('Should be able to create a new user', async () => {
    const { sut } = makeSut();

    const response = await sut.execute(makeValidInput());

    expect(response).toBeTruthy();
    expect(response).toHaveProperty('id');
  });

  test('Should return error if user already exists', async () => {
    const { sut } = makeSut();

    try {
      await sut.execute(makeValidInput());
      await sut.execute(makeValidInput());
    }catch(error) {
      expect(error).toBeInstanceOf(CreateUserError);
    }

  });

  test('Should return an hashed password', async () => {
    usersRepository = new InMemoryUsersRepository();
    const { sut } = makeSut();

    const { password } = await sut.execute(makeValidInput());
    expect(password).toBe('hashed-password');
  });

});
