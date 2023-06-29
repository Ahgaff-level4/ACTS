import { MigrationInterface, QueryRunner } from "typeorm"

export class AddPersonImageColumn1688025050051 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE person_entity ADD COLUMN image varchar(80);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE person_entity DROP COLUMN image;`)

    }

}
