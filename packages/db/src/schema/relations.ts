import { relations } from "drizzle-orm";

import { user } from "./auth";
import { taskComment } from "./comments";
import { project } from "./projects";
import { tag, taskTag } from "./tags";
import { task } from "./tasks";

export const taskRelations = relations(task, ({ many, one }) => ({
	assignee: one(user, {
		fields: [task.assigneeId],
		references: [user.id],
	}),
	project: one(project, {
		fields: [task.projectId],
		references: [project.id],
	}),
	taskComments: many(taskComment),
	taskTags: many(taskTag),
}));

export const taskTagRelations = relations(taskTag, ({ one }) => ({
	tag: one(tag, { fields: [taskTag.tagId], references: [tag.id] }),
	task: one(task, { fields: [taskTag.taskId], references: [task.id] }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
	taskTags: many(taskTag),
}));

export const taskCommentRelations = relations(taskComment, ({ one }) => ({
	author: one(user, {
		fields: [taskComment.authorId],
		references: [user.id],
	}),
	task: one(task, { fields: [taskComment.taskId], references: [task.id] }),
}));
