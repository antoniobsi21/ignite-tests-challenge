import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id)

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(amount <= 0) {
      throw new CreateStatementError.InvalidAmmount();
    }

    if(type === 'withdraw') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    } else if (type === 'transfer') {
      if (!sender_id) {
        throw new CreateStatementError.InvalidOperation()
      }

      const sender = await this.usersRepository.findById(sender_id)

      if(!sender) {
        throw new CreateStatementError.UserNotFound();
      }

      const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id })

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id: type === 'transfer' ? sender_id : undefined,
    });

    return statementOperation;
  }
}
