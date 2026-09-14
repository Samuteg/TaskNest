import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const projectRoleEnum = pgEnum("project_role", [
	"owner",
	"admin",
	"member",
]);

export const project = pgTable(
	"project",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		description: text("description"),
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("project_ownerId_idx").on(table.ownerId)]
);

export const projectMember = pgTable(
	"project_member",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		role: projectRoleEnum("role").default("member").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("project_member_projectId_userId_uidx").on(
			table.projectId,
			table.userId
		),
		index("project_member_projectId_idx").on(table.projectId),
		index("project_member_userId_idx").on(table.userId),
	]
);

export const projectRelations = relations(project, ({ one, many }) => ({
	members: many(projectMember),
	owner: one(user, {
		fields: [project.ownerId],
		references: [user.id],
	}),
}));

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
	project: one(project, {
		fields: [projectMember.projectId],
		references: [project.id],
	}),
	user: one(user, {
		fields: [projectMember.userId],
		references: [user.id],
	}),
}));
