ALTER TABLE `loans` RENAME COLUMN `member_id` TO `borrower_member_id`;--> statement-breakpoint
ALTER TABLE `loans` DROP FOREIGN KEY `loans_member_id_members_id_fk`;
--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `borrower_member_id` int;--> statement-breakpoint
ALTER TABLE `loans` ADD `borrower_user_id` int;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_borrower_member_id_members_id_fk` FOREIGN KEY (`borrower_member_id`) REFERENCES `members`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_borrower_user_id_users_id_fk` FOREIGN KEY (`borrower_user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;