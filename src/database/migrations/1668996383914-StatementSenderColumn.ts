import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class StatementSenderColumn1668996383914 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'statements',
      new TableColumn(
        {
          name: 'sender_id',
          isNullable: true,
          type: 'uuid',
        }
      ))
    await queryRunner.createForeignKey(
      'statements',
      new TableForeignKey({
        columnNames: ['sender_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // SET NULL MAYBE
      }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('statements', 'sender_id');
  }

}
