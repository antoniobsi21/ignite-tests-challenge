
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Get User Balance', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should be able to deposit if user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });
    const statementResult = await createStatementUseCase.execute({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    expect(statementResult).toHaveProperty('id');

    expect(statementResult).toHaveProperty('amount');
    expect(statementResult.amount).toEqual(150);
    expect(statementResult).toHaveProperty('type');
    expect(statementResult.type).toEqual('deposit');

  })

  it('should be able to withdraw if has "money" and user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });
    await createStatementUseCase.execute({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const statementResult = await createStatementUseCase.execute({
      amount: 100,
      description: 'Test',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    })

    expect(statementResult).toHaveProperty('id');

    expect(statementResult).toHaveProperty('amount');
    expect(statementResult.amount).toEqual(100);
    expect(statementResult).toHaveProperty('type');
    expect(statementResult.type).toEqual('withdraw');

  })

  it('should not be able to withdraw if user doesnt have enough "money"', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });
      await createStatementUseCase.execute({
        amount: 150,
        description: 'Test',
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      })
  
      await createStatementUseCase.execute({
        amount: 100,
        description: 'Test',
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      })
  
      await createStatementUseCase.execute({
        amount: 51,
        description: 'Test',
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it('should not be able to deposit from invalid user id', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });
      await createStatementUseCase.execute({
        amount: 150,
        description: 'Test',
        type: OperationType.DEPOSIT,
        user_id: user.id + 'i',
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to withdraw from invalid user id', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });
      await createStatementUseCase.execute({
        amount: 150,
        description: 'Test',
        type: OperationType.WITHDRAW,
        user_id: user.id + 'i',
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })
})