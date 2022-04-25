import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

interface SutTypes {
  sut: CreateStatementUseCase;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const userRepository = new InMemoryUsersRepository();
const userCreate = new CreateUserUseCase(userRepository);
let user: User;

const makeSut = (): SutTypes => {
  const statementRepository = new InMemoryStatementsRepository();
  const sut = new CreateStatementUseCase(
    userRepository,
    statementRepository
  );
  return {
    sut,
  }
}

describe('CreateStatement UseCase', () => {

  beforeAll(async () => {
    user = await userCreate.execute({
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'valid_pass'
    });
  })

  test('Should be able to create a new rental', async () => {
    const { sut } = makeSut();
    expect(user.id).toBeTruthy();
    if(user.id){
      const response = await sut.execute({
        amount: 150,
        description: 'description',
        type: OperationType.DEPOSIT,
        user_id: user.id,
      });
      expect(response).toBeInstanceOf(Statement);
      expect(response).toHaveProperty('id');
    }
  });

  test('Should return error if an invalid user_id is provided', async () => {
    const { sut } = makeSut();
    expect(user.id).toBeTruthy();
    if(user.id){
      try{
        const promise = sut.execute({
          amount: 0,
          description: 'description',
          type: OperationType.DEPOSIT,
          user_id: 'invalid_id',
        });
        expect(promise).rejects.toBeInstanceOf(AppError);
      }catch(error: any){
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toEqual('User not found');
      }
    }
  });

  test('Should return error if an invalid ammount is provided', async () => {
    const { sut } = makeSut();
    expect(user.id).toBeTruthy();
    if(user.id){
      let response;
      try{
        response = await sut.execute({
          amount: 500,
          description: 'description',
          type: OperationType.WITHDRAW,
          user_id: user.id,
        });
      }catch(error: any) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toEqual('Insufficient funds');
      }
    }
  });
});
