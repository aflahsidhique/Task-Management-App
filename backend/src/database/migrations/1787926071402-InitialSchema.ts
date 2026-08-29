import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787926071402 implements MigrationInterface {
  name = 'InitialSchema1787926071402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "permissions" text NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3fc9b8d1e39258c9a395b18377" ON "role" ("name") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "avatarUrl" character varying, "jobTitle" character varying, "mobile" character varying, "status" "public"."user_status_enum" NOT NULL DEFAULT 'ACTIVE', "refreshTokenHash" character varying, "passwordResetTokenHash" character varying, "passwordResetExpiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "roleId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d44ccf43b8a0d6b9978affb88" ON "user" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d0012b9482ca5b4f270e6fdb5e" ON "user" ("email") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_status_enum" AS ENUM('ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'ON_HOLD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "status" "public"."project_status_enum" NOT NULL DEFAULT 'ON_TRACK', "startDate" date NOT NULL, "endDate" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerId" integer, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57856cedbec1fbed761154d162" ON "project" ("status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'TODO', "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'MEDIUM', "dueDate" date, "estimatedHours" numeric(6,2), "actualHours" numeric(6,2), "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "projectId" integer, "assigneeId" integer, "reporterId" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fe7a278e6f08d2be55740a939" ON "task" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f092f3386f10f2e2ef5b0b6ad1" ON "task" ("priority") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_390b81554c9b89631cda24db60" ON "task" ("dueDate") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('TASK_ASSIGNED', 'TASK_DUE', 'PROJECT_UPDATE', 'MENTION', 'SYSTEM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "link" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ced25315eb974b73391fb1c81" ON "notification" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_080ab397c379af09b9d2169e5b" ON "notification" ("isRead") `,
    );
    await queryRunner.query(
      `CREATE TABLE "file_asset" ("id" SERIAL NOT NULL, "originalName" character varying NOT NULL, "storedFileName" character varying NOT NULL, "mimeType" character varying NOT NULL, "sizeBytes" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "uploadedById" integer, "projectId" integer, "taskId" integer, CONSTRAINT "PK_4cc6688b434b7f95a9788fa5f4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8484c21753196991604758d3f" ON "file_asset" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9214cdc405ca85155613b96bb5" ON "file_asset" ("taskId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_type_enum" AS ENUM('TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'FILE_UPLOADED', 'COMMENT_ADDED', 'COMMENT_DELETED', 'USER_LOGIN', 'USER_LOGOUT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" SERIAL NOT NULL, "type" "public"."activity_type_enum" NOT NULL, "entityType" character varying NOT NULL, "entityId" integer NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_caa645b86d8db66739106100a2" ON "activity" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "authorId" integer NOT NULL, "taskId" integer, "projectId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fc19c95c33ef4d97d09b72ee9" ON "comment" ("taskId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61e5bdd38addac8d6219ca102e" ON "comment" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project_members" ("projectId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_326b2a901eb18ac24eabc9b0581" PRIMARY KEY ("projectId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d19892d8f03928e5bfc7313780" ON "project_members" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08d1346ff91abba68e5a637cfd" ON "project_members" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_mentions" ("commentId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_11054ceba1bed401adbb83b8fbb" PRIMARY KEY ("commentId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc73b25397fe92549b4c41dfe5" ON "comment_mentions" ("commentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0294c9da809e60b4f2472d4c83" ON "comment_mentions" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_7384988f7eeb777e44802a0baca" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_d7263b567c2d0945fd5aa9ab671" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" ADD CONSTRAINT "FK_dbae27ec45a080510e47a48ec24" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" ADD CONSTRAINT "FK_b8484c21753196991604758d3f0" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" ADD CONSTRAINT "FK_9214cdc405ca85155613b96bb5d" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_d19892d8f03928e5bfc7313780c" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_08d1346ff91abba68e5a637cfdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mentions" ADD CONSTRAINT "FK_dc73b25397fe92549b4c41dfe56" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mentions" ADD CONSTRAINT "FK_0294c9da809e60b4f2472d4c835" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_mentions" DROP CONSTRAINT "FK_0294c9da809e60b4f2472d4c835"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mentions" DROP CONSTRAINT "FK_dc73b25397fe92549b4c41dfe56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_08d1346ff91abba68e5a637cfdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_d19892d8f03928e5bfc7313780c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" DROP CONSTRAINT "FK_9214cdc405ca85155613b96bb5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" DROP CONSTRAINT "FK_b8484c21753196991604758d3f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_asset" DROP CONSTRAINT "FK_dbae27ec45a080510e47a48ec24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_d7263b567c2d0945fd5aa9ab671"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_7384988f7eeb777e44802a0baca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0294c9da809e60b4f2472d4c83"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc73b25397fe92549b4c41dfe5"`,
    );
    await queryRunner.query(`DROP TABLE "comment_mentions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08d1346ff91abba68e5a637cfd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d19892d8f03928e5bfc7313780"`,
    );
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61e5bdd38addac8d6219ca102e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9fc19c95c33ef4d97d09b72ee9"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_caa645b86d8db66739106100a2"`,
    );
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`DROP TYPE "public"."activity_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9214cdc405ca85155613b96bb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8484c21753196991604758d3f"`,
    );
    await queryRunner.query(`DROP TABLE "file_asset"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_080ab397c379af09b9d2169e5b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ced25315eb974b73391fb1c81"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_390b81554c9b89631cda24db60"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f092f3386f10f2e2ef5b0b6ad1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2fe7a278e6f08d2be55740a939"`,
    );
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57856cedbec1fbed761154d162"`,
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0012b9482ca5b4f270e6fdb5e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d44ccf43b8a0d6b9978affb88"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3fc9b8d1e39258c9a395b18377"`,
    );
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
