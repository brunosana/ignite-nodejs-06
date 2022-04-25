import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from './GetBalanceUseCase';

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();

interface SutTypes {
  sut: GetBalanceUseCase;
}

const makeSut = (): SutTypes => {
  const sut = new GetBalanceUseCase(
    statementsRepository,
    usersRepository,
  );

  return {
    sut,
  }

}

describe('GetBalance UseCase', () => {

  let userId: string;

  beforeAll(async () => {
    const { id } = await usersRepository.create({
      name: 'user-name',
      email: 'user-mail@mail.com',
      password: 'user-password',
    });
    userId = id ? id : '';
  })

  test('Should be able to get balance', async () => {
    const { sut } = makeSut();

    const { balance, statement } = await sut.execute({ user_id: userId });

    expect(balance).toBe(0);
    expect(statement).toEqual([]);
  });

  test('Should return error if invalid id is provided', async () => {
    const { sut } = makeSut();

    try {
      await sut.execute({ user_id: 'invalid-id' });
    } catch(error){
      expect(error).toBeInstanceOf(GetBalanceError);
    }

  });
});
