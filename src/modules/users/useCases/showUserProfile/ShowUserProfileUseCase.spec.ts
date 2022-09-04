
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile Use Case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to deposit if user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test User',
      email: 'test@mail.com',
      password: 'test',
    });
    const userProfile = await showUserProfileUseCase.execute(user.id as string)

    expect(userProfile).toHaveProperty('id');

    expect(userProfile).toHaveProperty('name');
    expect(userProfile.name).toEqual('Test User');
    expect(userProfile).toHaveProperty('email');
    expect(userProfile.email).toEqual('test@mail.com');

  });

  it('should not be able to get profile of invalid user', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Test User',
        email: 'test@mail.com',
        password: 'test',
      });
      await showUserProfileUseCase.execute(user.id + 'invalid_id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

})