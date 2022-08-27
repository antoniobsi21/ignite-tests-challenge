import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase'
import { compare } from 'bcryptjs';
import { CreateUserError } from './CreateUserError';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository
describe('Create User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('it should be able to create a user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Antonio',
      email: 'antonio.fernandes.bsi@gmail.com',
      password: '123'
    });
    const passwordMatch = await compare('123', user.password);

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user.name).toEqual('Antonio');
    expect(user).toHaveProperty('email');
    expect(user.email).toEqual('antonio.fernandes.bsi@gmail.com');
    expect(passwordMatch).toEqual(true);
  });

  it('it should not be able to create a user with email is already taken', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Antonio',
        email: 'antonio.fernandes.bsi@gmail.com',
        password: '123'
      });
      const user = await createUserUseCase.execute({
        name: 'Antonio',
        email: 'antonio.fernandes.bsi@gmail.com',
        password: '123'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
})