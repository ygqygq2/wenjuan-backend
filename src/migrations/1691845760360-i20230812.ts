import { MigrationInterface, QueryRunner } from "typeorm";

export class i202308121691845760360 implements MigrationInterface {
    name = 'i202308121691845760360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`question\` DROP FOREIGN KEY \`FK_8122dda9c0b9f3b8592290fb1ad\``);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`publishedAt\` \`publishedAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`creator\` \`creator\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`profile\` DROP FOREIGN KEY \`FK_a24972ebd73b106250713dcddd9\``);
        await queryRunner.query(`ALTER TABLE \`profile\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP FOREIGN KEY \`FK_a1196a1956403417fe3a0343390\``);
        await queryRunner.query(`ALTER TABLE \`logs\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` DROP FOREIGN KEY \`FK_c45fdf839bafeb800270101048c\``);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` CHANGE \`component_fe_id\` \`component_fe_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`component\` DROP FOREIGN KEY \`FK_dcf56c27a001feff39e16c953f9\``);
        await queryRunner.query(`ALTER TABLE \`component\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` DROP FOREIGN KEY \`FK_c67450c41262f4a8c745421a2c4\``);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_info\` DROP FOREIGN KEY \`FK_fbd976b267dd59da8dfa8f2277e\``);
        await queryRunner.query(`ALTER TABLE \`question_info\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` DROP FOREIGN KEY \`FK_44b5a1a6196af21b2091dd7905c\``);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` DROP FOREIGN KEY \`FK_72d99a5fe3007f2b97378746296\``);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` CHANGE \`component_fe_id\` \`component_fe_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`question_radio\` DROP FOREIGN KEY \`FK_3ca4b9531fd5683991ab42959f8\``);
        await queryRunner.query(`ALTER TABLE \`question_radio\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` DROP FOREIGN KEY \`FK_89680be74395ade32089cedcb54\``);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_title\` DROP FOREIGN KEY \`FK_a37dde0de2cf80a4cf933e3ab47\``);
        await queryRunner.query(`ALTER TABLE \`question_title\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_input\` DROP FOREIGN KEY \`FK_4072175621ea64fa270134acbde\``);
        await queryRunner.query(`ALTER TABLE \`question_input\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stat\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`question\` ADD CONSTRAINT \`FK_8122dda9c0b9f3b8592290fb1ad\` FOREIGN KEY (\`creator\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile\` ADD CONSTRAINT \`FK_a24972ebd73b106250713dcddd9\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD CONSTRAINT \`FK_a1196a1956403417fe3a0343390\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` ADD CONSTRAINT \`FK_c45fdf839bafeb800270101048c\` FOREIGN KEY (\`component_fe_id\`) REFERENCES \`question_checkbox\`(\`fe_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`component\` ADD CONSTRAINT \`FK_dcf56c27a001feff39e16c953f9\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` ADD CONSTRAINT \`FK_c67450c41262f4a8c745421a2c4\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_info\` ADD CONSTRAINT \`FK_fbd976b267dd59da8dfa8f2277e\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` ADD CONSTRAINT \`FK_44b5a1a6196af21b2091dd7905c\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` ADD CONSTRAINT \`FK_72d99a5fe3007f2b97378746296\` FOREIGN KEY (\`component_fe_id\`) REFERENCES \`question_radio\`(\`fe_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_radio\` ADD CONSTRAINT \`FK_3ca4b9531fd5683991ab42959f8\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` ADD CONSTRAINT \`FK_89680be74395ade32089cedcb54\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_title\` ADD CONSTRAINT \`FK_a37dde0de2cf80a4cf933e3ab47\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_input\` ADD CONSTRAINT \`FK_4072175621ea64fa270134acbde\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`question_input\` DROP FOREIGN KEY \`FK_4072175621ea64fa270134acbde\``);
        await queryRunner.query(`ALTER TABLE \`question_title\` DROP FOREIGN KEY \`FK_a37dde0de2cf80a4cf933e3ab47\``);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` DROP FOREIGN KEY \`FK_89680be74395ade32089cedcb54\``);
        await queryRunner.query(`ALTER TABLE \`question_radio\` DROP FOREIGN KEY \`FK_3ca4b9531fd5683991ab42959f8\``);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` DROP FOREIGN KEY \`FK_72d99a5fe3007f2b97378746296\``);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` DROP FOREIGN KEY \`FK_44b5a1a6196af21b2091dd7905c\``);
        await queryRunner.query(`ALTER TABLE \`question_info\` DROP FOREIGN KEY \`FK_fbd976b267dd59da8dfa8f2277e\``);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` DROP FOREIGN KEY \`FK_c67450c41262f4a8c745421a2c4\``);
        await queryRunner.query(`ALTER TABLE \`component\` DROP FOREIGN KEY \`FK_dcf56c27a001feff39e16c953f9\``);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` DROP FOREIGN KEY \`FK_c45fdf839bafeb800270101048c\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP FOREIGN KEY \`FK_a1196a1956403417fe3a0343390\``);
        await queryRunner.query(`ALTER TABLE \`profile\` DROP FOREIGN KEY \`FK_a24972ebd73b106250713dcddd9\``);
        await queryRunner.query(`ALTER TABLE \`question\` DROP FOREIGN KEY \`FK_8122dda9c0b9f3b8592290fb1ad\``);
        await queryRunner.query(`ALTER TABLE \`stat\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`question_input\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_input\` ADD CONSTRAINT \`FK_4072175621ea64fa270134acbde\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_title\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_title\` ADD CONSTRAINT \`FK_a37dde0de2cf80a4cf933e3ab47\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_textarea\` ADD CONSTRAINT \`FK_89680be74395ade32089cedcb54\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_radio\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_radio\` ADD CONSTRAINT \`FK_3ca4b9531fd5683991ab42959f8\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` CHANGE \`component_fe_id\` \`component_fe_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_radio_option\` ADD CONSTRAINT \`FK_72d99a5fe3007f2b97378746296\` FOREIGN KEY (\`component_fe_id\`) REFERENCES \`question_radio\`(\`fe_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_paragraph\` ADD CONSTRAINT \`FK_44b5a1a6196af21b2091dd7905c\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_info\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_info\` ADD CONSTRAINT \`FK_fbd976b267dd59da8dfa8f2277e\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox\` ADD CONSTRAINT \`FK_c67450c41262f4a8c745421a2c4\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`component\` CHANGE \`question_id\` \`question_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`component\` ADD CONSTRAINT \`FK_dcf56c27a001feff39e16c953f9\` FOREIGN KEY (\`question_id\`) REFERENCES \`question\`(\`_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` CHANGE \`component_fe_id\` \`component_fe_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_checkbox_option\` ADD CONSTRAINT \`FK_c45fdf839bafeb800270101048c\` FOREIGN KEY (\`component_fe_id\`) REFERENCES \`question_checkbox\`(\`fe_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logs\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD CONSTRAINT \`FK_a1196a1956403417fe3a0343390\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`profile\` ADD CONSTRAINT \`FK_a24972ebd73b106250713dcddd9\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`creator\` \`creator\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`publishedAt\` \`publishedAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`question\` ADD CONSTRAINT \`FK_8122dda9c0b9f3b8592290fb1ad\` FOREIGN KEY (\`creator\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
