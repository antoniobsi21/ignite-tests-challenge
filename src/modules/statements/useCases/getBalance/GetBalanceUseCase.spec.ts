
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase'

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance Use Case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it('should be able to get the balance if user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });
    inMemoryStatementsRepository.create({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });
    inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Test',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });
    inMemoryStatementsRepository.create({
      amount: 75,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const getBalanceUseCaseResult = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(getBalanceUseCaseResult).toHaveProperty('balance');

    expect(getBalanceUseCaseResult.balance).toBe(125);
  })
  
  it('(tranfer operations) should be subtracted from balance', async () => {
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

    inMemoryStatementsRepository.create({
      amount: 150,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });
    inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Test',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });
    inMemoryStatementsRepository.create({
      amount: 75,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });
    inMemoryStatementsRepository.create({
      amount: 75,
      description: 'Test',
      type: OperationType.TRANSFER,
      user_id: user2.id as string,
      sender_id: user.id
    });

    const getBalanceUseCaseResult = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    const getBalanceUseCaseResult2 = await getBalanceUseCase.execute({
      user_id: user2.id as string,
    });

    expect(getBalanceUseCaseResult).toHaveProperty('balance');

    expect(getBalanceUseCaseResult.balance).toBe(50);

    expect(getBalanceUseCaseResult2).toHaveProperty('balance');

    expect(getBalanceUseCaseResult2.balance).toBe(75);
  })
})