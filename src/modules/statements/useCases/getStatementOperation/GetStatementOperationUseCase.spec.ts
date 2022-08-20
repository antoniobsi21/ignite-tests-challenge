
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { User } from '../../../users/entities/User';
import { Statement } from '../../entities/Statement';
import { GetStatementOperationError } from './GetStatementOperationError';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user1: User;
let statement1: Statement;

describe('Get User Balance', () => {

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

    user1 = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });
    statement1 = await inMemoryStatementsRepository.create({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user1.id as string,
    });
  })

  it('should be able to get statement operation if exists', async () => {
    const statementOperationResult = await getStatementOperationUseCase.execute({
      statement_id: statement1.id as string,
      user_id: user1.id as string,
    });

    expect(statementOperationResult).toHaveProperty('id');

    expect(statementOperationResult).toHaveProperty('amount');
    expect(statementOperationResult.amount).toEqual(150);
    expect(statementOperationResult).toHaveProperty('type');
    expect(statementOperationResult.type).toEqual('deposit');
  });

  it('should not be able to get statement operation if user doesnt exists', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: statement1.id as string,
        user_id: user1.id + '1',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get statement operation if doesnt exists', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: statement1.id + '1',
        user_id: user1.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})