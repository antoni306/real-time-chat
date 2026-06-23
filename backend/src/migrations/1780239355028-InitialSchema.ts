import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780239355028 implements MigrationInterface {
    name = 'InitialSchema1780239355028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_6b54f24a585e94ef3fc7aa7ef5d"`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_6b54f24a585e94ef3fc7aa7ef5d" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_6b54f24a585e94ef3fc7aa7ef5d"`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_6b54f24a585e94ef3fc7aa7ef5d" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
