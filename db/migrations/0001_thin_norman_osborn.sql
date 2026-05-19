ALTER TABLE `members` DROP INDEX `email`;--> statement-breakpoint
ALTER TABLE `books` DROP FOREIGN KEY `fk_books_author`;
--> statement-breakpoint
ALTER TABLE `loans` DROP FOREIGN KEY `fk_loans_book`;
--> statement-breakpoint
ALTER TABLE `loans` DROP FOREIGN KEY `fk_loans_member`;
--> statement-breakpoint
ALTER TABLE `members` MODIFY COLUMN `joined_at` date NOT NULL DEFAULT (CURRENT_DATE);--> statement-breakpoint
ALTER TABLE `members` ADD CONSTRAINT `members_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE restrict ON UPDATE cascade;