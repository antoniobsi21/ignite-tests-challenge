
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase'

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get User Balance', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it('should be able to get the balance if authenticated', async () => {
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
})