import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { project } from "./projects";

export const taskStatusEnum = pgEnum("task_status", [
	"todo",
	"in_progress",
	"done",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

export const task = pgTable(
	"task",
	{
		assigneeId: text("assignee_id").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		description: text("description"),
		dueDate: timestamp("due_date"),
		id: uuid("id").defaultRandom().primaryKey(),
		priority: taskPriorityEnum("priority").default("medium").notNull(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		status: taskStatusEnum("status").default("todo").notNull(),
		title: text("title").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("task_projectId_idx").on(table.projectId),
		index("task_projectId_createdAt_idx").on(table.projectId, table.createdAt),
		index("task_assigneeId_idx").on(table.assigneeId),
		index("task_status_idx").on(table.status),
	]
);
