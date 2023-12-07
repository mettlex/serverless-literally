CREATE TABLE `literally-chained-words` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chain_id` int NOT NULL,
	`first_word_id` varchar(255) NOT NULL,
	`word` varchar(255) NOT NULL,
	`previous_word` varchar(255),
	`correct_spelling` boolean NOT NULL,
	`discord_user_id` varchar(255),
	`discord_message_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `literally-chained-words_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literally-wc-unlimited` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`count` int NOT NULL,
	`last_correct_word` varchar(255) NOT NULL,
	`starter_user_id` varchar(255) NOT NULL,
	`discord_guild_id` varchar(255),
	`discord_channel_id` varchar(255),
	`longest_word` varchar(255) NOT NULL,
	`rule_flags` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`ended_at` timestamp,
	CONSTRAINT `literally-wc-unlimited_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `literally-chained-words` ADD CONSTRAINT `literally-chained-words_chain_id_literally-wc-unlimited_id_fk` FOREIGN KEY (`chain_id`) REFERENCES `literally-wc-unlimited`(`id`) ON DELETE no action ON UPDATE no action;