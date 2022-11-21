import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class InvalidOperation extends AppError {
    constructor() {
      super('Invalid operation', 400);
    }
  }

  export class InvalidAmmount extends AppError {
    constructor() {
      super('Invalid ammount', 400);
    }
  }
}
