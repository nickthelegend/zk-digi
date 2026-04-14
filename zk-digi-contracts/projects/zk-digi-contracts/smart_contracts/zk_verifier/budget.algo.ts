import { Contract } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'

/**
 * A minimal contract used solely to increase the opcode budget.
 * Each NoOp call to this app adds 700 units to the group's budget pool.
 */
export class BudgetApp extends Contract {
  @abimethod()
  public noop(): void {
    // Do nothing
  }
}
