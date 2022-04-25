let compareReturn = true;

import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

jest.mock('bcryptjs', () => ({
  hash: (password: string, salt: number): Promise<string> => {
    return Promise.resolve('hashed-password');
  },
  compare: (password: string, toCompate: string): Promise<boolean> => {
     return Promise.resolve(compareReturn);
  }
}));

jest.mock('jsonwebtoken', () => ({
  sign: (data: any): string => {
    return 'valid-token';
  },
}));


let usersRepository = new InMemoryUsersRepository();

interface SutTypes {
  sut: AuthenticateUserUseCase;
}

const makeValidInput = (): ICreateUserDTO => ({
  email: 'valid-mail@mail.com',
  name: 'valid-name',
  password: 'valid-pass'
});

const makeSut = (): SutTypes => {
  const sut = new AuthenticateUserUseCase(usersRepository);

  return {
    sut,
  }
}

describe('AuthenticateUser UseCase', () => {
  let userId: string;
  let user: User;

  beforeAll(async () => {
    user = await usersRepository.create(makeValidInput());

    userId = user.id ? user.id : '';
  });

  test('Should authenticate a user', async () => {
    const { sut } = makeSut();

    const response = await sut.execute({
      email: user.email,
      password: user.password,
    });

    const expectedUser = user;

    // @ts-ignore
    delete expectedUser.password;

    expect(response).toEqual({
      token: 'valid-token',
      user: expectedUser
    });
  });

  test('Should return error if an invalid email is provided', async () => {
    const { sut } = makeSut();

    try {
      await sut.execute({
        email: 'invalid-email@mail.com',
        password: user.password,
      });
    }catch(error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });

  test('Should return error if an invalid password is provided', async () => {
    const { sut } = makeSut();

    compareReturn = false;

    try {
      await sut.execute({
        email: user.email,
        password: 'invalid-password',
      });
    }catch(error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });
});
