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
import { project } from "./projects";

export const invitationStatusEnum = pgEnum("invitation_status", [
	"pending",
	"accepted",
	"expired",
]);

export const invitation = pgTable(
	"invitation",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		email: text("email").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		invitedBy: text("invited_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		projectId: uuid("project_id")
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		status: invitationStatusEnum("status").default("pending").notNull(),
	},
	(table) => [
		uniqueIndex("invitation_projectId_email_uidx").on(
			table.projectId,
			table.email
		),
		index("invitation_projectId_idx").on(table.projectId),
		index("invitation_email_idx").on(table.email),
	]
);

export const invitationRelations = relations(invitation, ({ one }) => ({
	invitedByUser: one(user, {
		fields: [invitation.invitedBy],
		references: [user.id],
	}),
	project: one(project, {
		fields: [invitation.projectId],
		references: [project.id],
	}),
}));
