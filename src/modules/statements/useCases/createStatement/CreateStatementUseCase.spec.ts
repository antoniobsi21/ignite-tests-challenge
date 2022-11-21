
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statement Use Case', () => {

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

  it('should be able to withdraw if has enough "money" and user exists', async () => {
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
    await expect(async () => {
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
    await expect(async () => {
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
    await expect(async () => {
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

  it('should be able to transfer if both user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });

    const user2 = await inMemoryUsersRepository.create({
      name: 'Test User 2',
      email: 'test2@mail.com',
      password: 'test2',
    });

    const statementResult = await createStatementUseCase.execute({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const statementResult2 = await createStatementUseCase.execute({
      amount: 120,
      description: 'Transfer test',
      type: OperationType.TRANSFER,
      user_id: user2.id as string,
      sender_id: user.id
    })


    expect(statementResult2).toHaveProperty('id');
    expect(statementResult2).toHaveProperty('sender_id');
    expect(statementResult2.sender_id).toEqual(user.id);

    expect(statementResult2).toHaveProperty('amount');
    expect(statementResult2.amount).toEqual(120);
    expect(statementResult2).toHaveProperty('type');
    expect(statementResult2.type).toEqual('transfer');

  })

  it('should not be able to transfer if sender user does not exists', async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });

      // await createStatementUseCase.execute({
      //   amount: 120,
      //   description: 'Transfer test',
      //   type: OperationType.DEPOSIT,
      //   user_id: user.id as string,
      //   sender_id: user.id
      // })
  
      await createStatementUseCase.execute({
        amount: 120,
        description: 'Transfer test',
        type: OperationType.TRANSFER,
        user_id: user.id as string,
        sender_id: '1089230129310' // Invalid ID
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to transfer if sender doesnt have enough "money"', async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });

      const user2 = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });
  
      await createStatementUseCase.execute({
        amount: 120,
        description: 'Transfer test',
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      })

      await createStatementUseCase.execute({
        amount: 150,
        description: 'Transfer test',
        type: OperationType.TRANSFER,
        user_id: user2.id as string,
        sender_id: user.id
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})