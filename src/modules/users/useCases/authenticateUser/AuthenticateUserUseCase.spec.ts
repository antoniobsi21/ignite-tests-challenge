import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      email: 'user@test.com',
      password: '1234',
      name: 'User test',
    };
    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate an nonexistent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'false@email.com',
        password: 'password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with incorrect password', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: 'user@test.com',
        password: '1234',
        name: 'User test',
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
