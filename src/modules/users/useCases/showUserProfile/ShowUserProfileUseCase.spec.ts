import { User } from '../../entities/User';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

jest.mock('bcryptjs', () => ({
  hash: (password: string, salt: number): Promise<string> => {
    return Promise.resolve('hashed-password');
  }
}))

let usersRepository = new InMemoryUsersRepository();

interface SutTypes {
  sut: ShowUserProfileUseCase;
}

const makeValidInput = (): ICreateUserDTO => ({
  email: 'valid-mail@mail.com',
  name: 'valid-name',
  password: 'valid-pass'
});

const makeSut = (): SutTypes => {
  const sut = new ShowUserProfileUseCase(usersRepository);

  return {
    sut,
  }
}

describe('ShowUserProfile UseCase', () => {

  let userId: string;
  let user: User;

  beforeAll(async () => {
    user = await usersRepository.create(makeValidInput());

    userId = user.id ? user.id : '';
  });

  test('Should return a user profile', async () => {
    const { sut } = makeSut();

    const response = await sut.execute(userId);

    expect(response).toEqual(user);
  });

  test('Should return error user not exists', async () => {
    const { sut } = makeSut();

    try{
      await sut.execute('invalid-id');
    }catch(error) {
      expect(error).toBeInstanceOf(ShowUserProfileError);
    }

  });
});
