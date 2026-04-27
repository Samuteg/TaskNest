import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { FastifyInstance } from "fastify";
import User from "../../src/models/User.ts";
import Project from "../../src/models/project.model.ts";
import Task from "../../src/models/Task.ts";
import TeamInvite from "../../src/models/teamInvite.model.ts";
import CollaborationEvent from "../../src/models/collaborationEvent.model.ts";

vi.mock("../../src/lib/email.ts", () => ({
  sendPasswordResetEmail: vi.fn(async () => ({ sent: true })),
}));

vi.mock("../../src/lib/cloudinary.ts", () => ({
  isCloudinaryConfigured: false,
  uploadProfileImageToCloudinary: vi.fn(async () => ({
    secure_url: "https://example.com/avatar.png",
  })),
}));

let mongoServer: MongoMemoryServer;
let app: FastifyInstance;

const parseAuthCookie = (response: any) => {
  const cookie = response.headers["set-cookie"];
  if (!cookie) return "";
  if (Array.isArray(cookie)) return cookie[0].split(";")[0];
  return String(cookie).split(";")[0];
};

const uniqueEmail = (base: string) =>
  `${base}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const createUserAndLogin = async (email: string, password: string) => {
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/signup",
    payload: {
      fullName: "Test User",
      email,
      password,
    },
  });

  expect(response.statusCode).toBe(201);
  const cookie = parseAuthCookie(response);
  return { cookie, user: response.json() };
};

const createAuthenticatedUser = async () => {
  const email = uniqueEmail("user");
  const password = "123456";
  return createUserAndLogin(email, password);
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "tasknest_test",
  });

  const { default: createApp } = await import("../../src/app.ts");
  app = await createApp();
});

afterAll(async () => {
  await app.close();
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    TeamInvite.deleteMany({}),
    CollaborationEvent.deleteMany({}),
  ]);
});

describe("Auth controller", () => {
  it("should sign up a new user and set an auth cookie", async () => {
    const email = uniqueEmail("new-user");
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/signup",
      payload: {
        fullName: "New User",
        email,
        password: "123456",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.json()).toMatchObject({
      email,
      fullName: "New User",
    });
  });

  it("should log in an existing user and allow protected check endpoint", async () => {
    const { user } = await createAuthenticatedUser();

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: user.email,
        password: "123456",
      },
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginCookie = parseAuthCookie(loginResponse);
    expect(loginCookie).toContain("jwt=");

    const checkResponse = await app.inject({
      method: "GET",
      url: "/api/auth/check",
      headers: {
        cookie: loginCookie,
      },
    });

    expect(checkResponse.statusCode).toBe(200);
    expect(checkResponse.json().email).toBe(user.email);
  });

  it("should reset the password after forgot-password flow", async () => {
    const { user } = await createAuthenticatedUser();

    const forgotResponse = await app.inject({
      method: "POST",
      url: "/api/auth/forgot-password",
      payload: { email: user.email },
    });

    expect(forgotResponse.statusCode).toBe(200);
    const body = forgotResponse.json();
    expect(body.message).toBeDefined();
    expect(body.devResetToken).toBeDefined();

    const resetResponse = await app.inject({
      method: "POST",
      url: "/api/auth/reset-password",
      payload: {
        email: user.email,
        token: body.devResetToken,
        newPassword: "new-password",
      },
    });

    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.json().message).toContain("Senha redefinida");

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: user.email,
        password: "new-password",
      },
    });

    expect(loginResponse.statusCode).toBe(200);
  });

  it("should change the password for an authenticated user", async () => {
    const { cookie, user } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PUT",
      url: "/api/auth/change-password",
      headers: { cookie },
      payload: {
        currentPassword: "123456",
        newPassword: "updated-password",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe("Senha alterada com sucesso.");

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: user.email,
        password: "updated-password",
      },
    });

    expect(loginResponse.statusCode).toBe(200);
  });
});

describe("Project controller", () => {
  it("should create, list, update, and delete a project", async () => {
    const { cookie } = await createAuthenticatedUser();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { cookie },
      payload: { name: "My Project" },
    });

    expect(createResponse.statusCode).toBe(201);
    const project = createResponse.json();
    expect(project.name).toBe("My Project");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/projects",
      headers: { cookie },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/api/projects/${project._id}`,
      headers: { cookie },
      payload: { name: "Updated Project" },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().name).toBe("Updated Project");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/projects/${project._id}`,
      headers: { cookie },
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json().message).toContain("Projeto e tarefas associadas excluídos");
  });
});

describe("Task controller", () => {
  it("should create, fetch, update, and delete a task", async () => {
    const { cookie } = await createAuthenticatedUser();

    const projectResponse = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { cookie },
      payload: { name: "Task Project" },
    });
    const project = projectResponse.json();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/tasks",
      headers: { cookie },
      payload: {
        title: "Task Title",
        project: project._id,
        description: "A task description",
        priority: "high",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const task = createResponse.json();
    expect(task.title).toBe("Task Title");

    const listResponse = await app.inject({
      method: "GET",
      url: `/api/tasks/${project._id}`,
      headers: { cookie },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/api/tasks/${task._id}`,
      headers: { cookie },
      payload: { title: "Updated Task Title" },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().title).toBe("Updated Task Title");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/tasks/${task._id}`,
      headers: { cookie },
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toEqual({ message: "Tarefa excluída." });
  });
});

describe("Team controller", () => {
  it("should manage invites, list received invites, and accept an invitation", async () => {
    const { cookie } = await createAuthenticatedUser();
    const inviteeEmail = uniqueEmail("invitee");

    const projectResponse = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { cookie },
      payload: { name: "Invite Project" },
    });
    const project = projectResponse.json();

    const inviteResponse = await app.inject({
      method: "POST",
      url: "/api/team/invites",
      headers: { cookie },
      payload: {
        email: inviteeEmail,
        projectId: project._id,
        role: "viewer",
      },
    });

    expect(inviteResponse.statusCode).toBe(201);

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/team/invites",
      headers: { cookie },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const cancelResponse = await app.inject({
      method: "DELETE",
      url: `/api/team/invites/${inviteResponse.json()._id}`,
      headers: { cookie },
    });

    expect(cancelResponse.statusCode).toBe(200);

    const invitee = await createUserAndLogin(inviteeEmail, "654321");
    const secondInviteResponse = await app.inject({
      method: "POST",
      url: "/api/team/invites",
      headers: { cookie },
      payload: {
        email: inviteeEmail,
        projectId: project._id,
        role: "editor",
      },
    });

    expect(secondInviteResponse.statusCode).toBe(201);

    const respondResponse = await app.inject({
      method: "PATCH",
      url: `/api/team/invites/${secondInviteResponse.json()._id}/status`,
      headers: { cookie: invitee.cookie },
      payload: { status: "accepted" },
    });

    expect(respondResponse.statusCode).toBe(200);

    const receivedResponse = await app.inject({
      method: "GET",
      url: "/api/team/invites/received",
      headers: { cookie: invitee.cookie },
    });

    expect(receivedResponse.statusCode).toBe(200);
    expect(receivedResponse.json()).toHaveLength(1);
  });
});

describe("Collaboration controller", () => {
  it("should create comments, load collaboration feed, and mark notifications as read", async () => {
    const { cookie, user } = await createAuthenticatedUser();

    const projectResponse = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { cookie },
      payload: { name: "Collab Project" },
    });
    const project = projectResponse.json();

    const createCommentResponse = await app.inject({
      method: "POST",
      url: `/api/collaboration/projects/${project._id}/comments`,
      headers: { cookie },
      payload: {
        content: "Hello @mention@example.com, this is a test comment.",
      },
    });

    expect(createCommentResponse.statusCode).toBe(201);

    const notification = await CollaborationEvent.create({
      project: project._id,
      kind: "notification",
      audienceEmail: user.email,
      actor: user._id,
      content: "A test notification",
    });

    const feedResponse = await app.inject({
      method: "GET",
      url: `/api/collaboration/projects/${project._id}/feed`,
      headers: { cookie },
    });

    expect(feedResponse.statusCode).toBe(200);
    const feed = feedResponse.json();
    expect(feed.comments.length).toBeGreaterThanOrEqual(1);
    expect(feed.activities.length).toBeGreaterThanOrEqual(1);
    expect(feed.notifications.length).toBe(1);

    const markResponse = await app.inject({
      method: "PATCH",
      url: `/api/collaboration/notifications/${notification._id}/read`,
      headers: { cookie },
    });

    expect(markResponse.statusCode).toBe(200);
    expect(markResponse.json().readAt).toBeTruthy();
  });
});
