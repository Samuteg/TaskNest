import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { task } from "./tasks";

export const taskComment = pgTable(
	"task_comment",
	{
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("task_comment_taskId_idx").on(table.taskId)]
);
