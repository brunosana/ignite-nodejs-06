import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();

interface SutTypes {
  sut: GetStatementOperationUseCase;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const makeSut = (): SutTypes => {
  const sut = new GetStatementOperationUseCase(
    usersRepository,
    statementsRepository,
  );

  return {
    sut,
  }
}


describe('GetStatementOperation UseCase', () => {

  let userId: string;
  let statement: Statement;
  let statementId: string;

  beforeAll(async () => {
    const { id } = await usersRepository.create({
      name: 'user-name',
      email: 'user-mail@mail.com',
      password: 'user-password',
    });
    userId = id ? id : '';

    statement = await statementsRepository.create({
       user_id: userId,
       amount: 50,
       description: 'description-here',
       type: OperationType.DEPOSIT,
    });
    statementId = statement.id ? statement.id : '';
  })

  test('Should be able to return a valid statement operations', async () => {
    const { sut } = makeSut();

    const response = await sut.execute({
      user_id: userId,
      statement_id: statementId,
    });

    expect(response).toEqual(statement);
  });

  test('Should return error if an invalid user id is provided', async () => {
    const { sut } = makeSut();

    try{
      await sut.execute({
        user_id: 'invalid-id',
        statement_id: statementId,
      });
    }catch(error){
      expect(error).toBeInstanceOf(GetStatementOperationError.UserNotFound);
    }

  });

  test('Should return error if an invalid statement id is provided', async () => {
    const { sut } = makeSut();

    try{
      await sut.execute({
        user_id: userId,
        statement_id: 'invalid-statement-id',
      });
    }catch(error){
      expect(error).toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    }

  });
});
