import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { task } from "./tasks";

export const tag = pgTable(
	"tag",
	{
		color: text("color").default("#6366f1").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("tag_userId_name_uidx").on(table.userId, table.name),
		index("tag_userId_idx").on(table.userId),
	]
);

export const taskTag = pgTable(
	"task_tag",
	{
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.taskId, table.tagId] })]
);
