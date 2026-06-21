"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import TaskModal from "../components/TaskModal";
import SettingsModal from "../components/SettingsModal";
import NewProjectModal from "../components/NewProjectModal";
import { apiUrl } from "../lib/api";
import {
  Trash2,
  Edit3,
  Loader2,
  Plus,
  ArrowLeft,
  Settings,
  GripVertical,
  FolderKanban,
  Calendar,
  Check,
  X,
  MessageSquareText,
  History,
  Bell,
  AtSign,
  SendHorizontal,
} from "lucide-react";

export default function HomePage() {
  type TaskPriority = "low" | "medium" | "high";
  type TaskChecklistItem = {
    text: string;
    done: boolean;
  };
  type TaskItem = {
    _id: string;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    createdAt: string;
    order?: number;
    dueDate?: string | null;
    priority?: TaskPriority;
    assignee?: string;
    checklist?: TaskChecklistItem[];
  };
  type TaskStatus = TaskItem["status"];
  type TeamInviteStatus = "pending" | "accepted" | "declined";
  type ProjectAccessRole = "viewer" | "editor" | "admin";
  type ProjectItem = {
    _id: string;
    name: string;
    createdAt: string;
    accessRole?: ProjectAccessRole;
    isOwner?: boolean;
  };
  type UserItem = {
    _id?: string;
    fullName: string;
    email: string;
  };
  type InviteProject = {
    _id: string;
    name?: string;
  };
  type TeamInviteItem = {
    _id: string;
    email: string;
    status: TeamInviteStatus;
    createdAt: string;
    role?: ProjectAccessRole;
    project?: InviteProject | string | null;
  };
  type ReceivedTeamInviteItem = TeamInviteItem & {
    invitedBy?: {
      _id: string;
      fullName?: string;
      email?: string;
    } | null;
  };
  type CollaborationEventKind = "comment" | "activity" | "notification";
  type CollaborationActor = {
    _id: string;
    fullName?: string;
    email?: string;
  } | null;
  type CollaborationTaskRef = {
    _id: string;
    title?: string;
  } | null;
  type CollaborationItem = {
    _id: string;
    kind: CollaborationEventKind;
    content: string;
    createdAt: string;
    mentions?: string[];
    audienceEmail?: string | null;
    readAt?: string | null;
    actor?: CollaborationActor;
    task?: CollaborationTaskRef | string | null;
    metadata?: Record<string, unknown>;
  };

  const kanbanColumns: Array<{
    status: TaskStatus;
    label: string;
    emptyLabel: string;
    accent: string;
    dot: string;
    ring: string;
  }> = [
    {
      status: "todo",
      label: "Pendente",
      emptyLabel: "Sem tarefas pendentes.",
      accent: "text-amber-400",
      dot: "bg-amber-400",
      ring: "border-amber-400/20",
    },
    {
      status: "in-progress",
      label: "Em Progresso",
      emptyLabel: "Sem tarefas em progresso.",
      accent: "text-fuchsia-400",
      dot: "bg-fuchsia-400",
      ring: "border-fuchsia-400/20",
    },
    {
      status: "done",
      label: "Concluídas",
      emptyLabel: "Sem tarefas concluídas.",
      accent: "text-emerald-400",
      dot: "bg-emerald-400",
      ring: "border-emerald-400/20",
    },
  ];

  const cardAccents = [
    "bg-fuchsia-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-purple-600",
    "bg-rose-500",
  ];
  const inviteStatusMap: Record<
    TeamInviteStatus,
    { label: string; accent: string; dot: string }
  > = {
    pending: {
      label: "Pendente",
      accent:
        "border-amber-400/20 bg-amber-400/5 text-amber-400",
      dot: "bg-amber-400",
    },
    accepted: {
      label: "Aceito",
      accent:
        "border-emerald-400/20 bg-emerald-400/5 text-emerald-400",
      dot: "bg-emerald-400",
    },
    declined: {
      label: "Recusado",
      accent: "border-red-400/20 bg-red-400/5 text-red-400",
      dot: "bg-red-400",
    },
  };
  const projectRoleLabel: Record<ProjectAccessRole, string> = {
    viewer: "Viewer",
    editor: "Editor",
    admin: "Admin",
  };
  const priorityMeta: Record<
    TaskPriority,
    { label: string; badgeClass: string }
  > = {
    low: {
      label: "Baixa",
      badgeClass: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    },
    medium: {
      label: "Média",
      badgeClass: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    },
    high: {
      label: "Alta",
      badgeClass: "border-red-400/20 bg-red-400/10 text-red-300",
    },
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "25/01/2026";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "25/01/2026 00:00";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "25/01/2026 00:00";
    return parsedDate.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMentions = (text: string) => {
    return text.split(/(@[^\s@]+@[^\s@]+\.[^\s@]+)/g).map((part, index) => {
      if (!part.startsWith("@")) {
        return <span key={`plain-${index}`}>{part}</span>;
      }
      return (
        <span
          key={`mention-${index}`}
          className="rounded-md bg-fuchsia-400/10 px-1 py-0.5 text-fuchsia-300"
        >
          {part}
        </span>
      );
    });
  };

  const sortTasksByDisplayOrder = (taskList: TaskItem[]) => {
    return [...taskList].sort((a, b) => {
      const aOrder =
        typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder =
        typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getTasksByStatus = (taskList: TaskItem[], status: TaskStatus) =>
    sortTasksByDisplayOrder(taskList.filter((task) => task.status === status));

  const normalizeProjectRole = (role: string | undefined): ProjectAccessRole => {
    if (role === "admin" || role === "editor" || role === "viewer") return role;
    return "viewer";
  };

  const getInviteProjectId = (invite: TeamInviteItem) => {
    if (!invite.project) return "";
    if (typeof invite.project === "string") return invite.project;
    return invite.project._id;
  };

  const getInviteProjectName = (invite: TeamInviteItem) => {
    if (!invite.project) return "Projeto";
    if (typeof invite.project === "string") return "Projeto";
    return invite.project.name || "Projeto";
  };

  const moveTaskInBoard = (
    taskList: TaskItem[],
    draggedTaskId: string,
    targetStatus: TaskStatus,
    targetTaskId: string | null = null,
  ) => {
    if (targetTaskId && draggedTaskId === targetTaskId) return null;
    const columns = {
      todo: getTasksByStatus(taskList, "todo"),
      "in-progress": getTasksByStatus(taskList, "in-progress"),
      done: getTasksByStatus(taskList, "done"),
    } satisfies Record<TaskStatus, TaskItem[]>;

    const draggedTask = taskList.find((t) => t._id === draggedTaskId);
    if (!draggedTask) return null;

    const sourceTasks = columns[draggedTask.status];
    const sourceIndex = sourceTasks.findIndex((t) => t._id === draggedTaskId);
    if (sourceIndex < 0) return null;
    sourceTasks.splice(sourceIndex, 1);

    const movedTask = { ...draggedTask, status: targetStatus };
    const targetTasks = columns[targetStatus];
    const targetIndex = targetTaskId
      ? targetTasks.findIndex((t) => t._id === targetTaskId)
      : -1;
    if (targetIndex >= 0) targetTasks.splice(targetIndex, 0, movedTask);
    else targetTasks.push(movedTask);

    const normalized = {
      todo: columns.todo.map((t, i) => ({ ...t, order: i })),
      "in-progress": columns["in-progress"].map((t, i) => ({ ...t, order: i })),
      done: columns.done.map((t, i) => ({ ...t, order: i })),
    } satisfies Record<TaskStatus, TaskItem[]>;

    return kanbanColumns.flatMap((col) => normalized[col.status]);
  };

  const router = useRouter();
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // always dark to match system
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tasknest-theme");
    if (saved === "dark") setDarkMode(true);
    else if (saved === "light") setDarkMode(false);
    else setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("tasknest-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentView, setCurrentView] = useState<"projects" | "tasks" | "team">(
    "projects",
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [isReorderingTasks, setIsReorderingTasks] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectCreationError, setProjectCreationError] = useState("");
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [teamInvites, setTeamInvites] = useState<TeamInviteItem[]>([]);
  const [receivedTeamInvites, setReceivedTeamInvites] = useState<
    ReceivedTeamInviteItem[]
  >([]);
  const [isLoadingTeamInvites, setIsLoadingTeamInvites] = useState(false);
  const [isLoadingReceivedTeamInvites, setIsLoadingReceivedTeamInvites] =
    useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(
    null,
  );
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(
    null,
  );
  const [collaborationComments, setCollaborationComments] = useState<
    CollaborationItem[]
  >([]);
  const [collaborationActivities, setCollaborationActivities] = useState<
    CollaborationItem[]
  >([]);
  const [collaborationNotifications, setCollaborationNotifications] = useState<
    CollaborationItem[]
  >([]);
  const [isLoadingCollaboration, setIsLoadingCollaboration] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentTaskId, setCommentTaskId] = useState("");

  const activeProject = projects.find((p) => p._id === activeProjectId);
  const canEditActiveProjectTasks = Boolean(
    activeProject?.isOwner ||
      activeProject?.accessRole === "admin" ||
      activeProject?.accessRole === "editor",
  );
  const unreadNotificationCount = collaborationNotifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const fetchUserData = async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/core/get-session"), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const sessionUser = data.user || data.session?.user;
        if (sessionUser) {
          setUser({
            _id: sessionUser.id,
            fullName: sessionUser.name || sessionUser.fullName,
            email: sessionUser.email,
          });
        }
      } else router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(apiUrl("/api/projects"), {
        credentials: "include",
      });
      if (res.ok) {
        const payload = (await res.json()) as ProjectItem[];
        setProjects(payload);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/tasks/${projId}`), {
        credentials: "include",
      });
      if (res.ok) setTasks(sortTasksByDisplayOrder(await res.json()));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCollaborationFeed = async (
    projectId: string,
    options?: { silent?: boolean },
  ) => {
    try {
      if (!options?.silent) setIsLoadingCollaboration(true);
      const res = await fetch(apiUrl(`/api/collaboration/projects/${projectId}/feed`), {
        credentials: "include",
      });
      if (!res.ok) {
        setCollaborationComments([]);
        setCollaborationActivities([]);
        setCollaborationNotifications([]);
        return;
      }

      const payload = (await res.json()) as {
        comments?: CollaborationItem[];
        activities?: CollaborationItem[];
        notifications?: CollaborationItem[];
      };
      setCollaborationComments(payload.comments || []);
      setCollaborationActivities(payload.activities || []);
      setCollaborationNotifications(payload.notifications || []);
    } catch (error) {
      console.error("Erro ao carregar feed de colaboração:", error);
      setCollaborationComments([]);
      setCollaborationActivities([]);
      setCollaborationNotifications([]);
    } finally {
      if (!options?.silent) setIsLoadingCollaboration(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await fetchProjects();
      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || currentView !== "tasks") return;

    fetchCollaborationFeed(activeProjectId);

    const pollingId = window.setInterval(() => {
      fetchCollaborationFeed(activeProjectId, { silent: true });
    }, 30000);

    return () => window.clearInterval(pollingId);
  }, [activeProjectId, currentView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCommentDraft("");
    setCommentTaskId("");
  }, [activeProjectId]);

  useEffect(() => {
    if (!commentTaskId) return;
    const taskStillExists = tasks.some((task) => task._id === commentTaskId);
    if (!taskStillExists) setCommentTaskId("");
  }, [tasks, commentTaskId]);

  useEffect(() => {
    if (currentView !== "team") return;

    const loadTeamInvites = async () => {
      try {
        setIsLoadingTeamInvites(true);
        setIsLoadingReceivedTeamInvites(true);

        const [sentRes, receivedRes] = await Promise.all([
          fetch(apiUrl("/api/team/invites"), {
            credentials: "include",
          }),
          fetch(apiUrl("/api/team/invites/received"), {
            credentials: "include",
          }),
        ]);

        if (sentRes.ok) {
          const invites: TeamInviteItem[] = await sentRes.json();
          setTeamInvites(invites);
        } else {
          setTeamInvites([]);
        }

        if (receivedRes.ok) {
          const invites: ReceivedTeamInviteItem[] = await receivedRes.json();
          const statusPriority: Record<TeamInviteStatus, number> = {
            pending: 0,
            declined: 1,
            accepted: 2,
          };
          setReceivedTeamInvites(
            [...invites].sort((a, b) => {
              const aPriority = statusPriority[a.status] ?? 99;
              const bPriority = statusPriority[b.status] ?? 99;
              if (aPriority !== bPriority) return aPriority - bPriority;
              return (
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }),
          );
        } else {
          setReceivedTeamInvites([]);
        }
      } catch (err) {
        console.error(err);
        setTeamInvites([]);
        setReceivedTeamInvites([]);
      } finally {
        setIsLoadingTeamInvites(false);
        setIsLoadingReceivedTeamInvites(false);
      }
    };

    loadTeamInvites();
  }, [currentView]);

  const openCreateProjectModal = () => {
    setProjectCreationError("");
    setIsProjectModalOpen(true);
  };

  const handleCreateProject = async (projectName: string) => {
    const name = projectName.trim();
    if (!name) return;
    setIsCreatingProject(true);
    setProjectCreationError("");
    try {
      const res = await fetch(apiUrl("/api/projects"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!res.ok) {
        let errorMessage = "Não foi possível criar o projeto.";
        try {
          const payload = await res.json();
          if (payload?.message) errorMessage = payload.message;
        } catch {}
        setProjectCreationError(errorMessage);
        return;
      }
      await fetchProjects();
      setIsProjectModalOpen(false);
    } catch {
      setProjectCreationError("Erro ao criar projeto. Tente novamente.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!window.confirm("Excluir projeto e todas as tarefas?")) return;
    try {
      await fetch(apiUrl(`/api/projects/${projectId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId === projectId) setCurrentView("projects");
      fetchProjects();
    } catch {}
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Excluir esta tarefa?")) return;
    try {
      await fetch(apiUrl(`/api/tasks/${taskId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId) {
        fetchTasks(activeProjectId);
        fetchCollaborationFeed(activeProjectId, { silent: true });
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch(apiUrl("/api/auth/core/sign-out"), {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  const handleInviteMember = async () => {
    const manageableProjects = projects.filter(
      (project) => project.isOwner || project.accessRole === "admin",
    );

    if (!manageableProjects.length) {
      window.alert("Você precisa ser admin de um projeto para enviar convites.");
      return;
    }

    const rawEmail = window.prompt("Digite o e-mail do membro:");
    if (rawEmail === null) return;

    const email = rawEmail.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.alert("Informe um e-mail válido.");
      return;
    }

    const defaultProject =
      manageableProjects.find((project) => project._id === activeProjectId) ||
      manageableProjects[0];

    let selectedProject = defaultProject;
    if (manageableProjects.length > 1) {
      const optionsText = manageableProjects
        .map((project, index) => {
          const marker = project._id === defaultProject._id ? " (padrão)" : "";
          return `${index + 1}. ${project.name}${marker}`;
        })
        .join("\n");

      const selectedProjectText = window.prompt(
        `Escolha o projeto para o convite:\n${optionsText}\n\nDigite o número do projeto:`,
        String(manageableProjects.findIndex((project) => project._id === defaultProject._id) + 1),
      );

      if (selectedProjectText === null) return;

      const selectedIndex = Number.parseInt(selectedProjectText, 10) - 1;
      if (
        Number.isNaN(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= manageableProjects.length
      ) {
        window.alert("Seleção de projeto inválida.");
        return;
      }

      selectedProject = manageableProjects[selectedIndex];
    }

    const rawRole = window.prompt(
      "Defina o papel do membro: viewer, editor ou admin.",
      "viewer",
    );
    if (rawRole === null) return;

    const normalizedRole = rawRole.trim().toLowerCase();
    if (!["viewer", "editor", "admin"].includes(normalizedRole)) {
      window.alert("Papel inválido. Use viewer, editor ou admin.");
      return;
    }

    const alreadyPending = teamInvites.some(
      (invite) =>
        invite.email === email &&
        invite.status === "pending" &&
        getInviteProjectId(invite) === selectedProject._id,
    );
    if (alreadyPending) {
      window.alert("Já existe um convite pendente para este e-mail neste projeto.");
      return;
    }

    setIsInvitingMember(true);
    try {
      const res = await fetch(apiUrl("/api/team/invites"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          projectId: selectedProject._id,
          role: normalizedRole,
        }),
        credentials: "include",
      });

      const payload = (await res
        .json()
        .catch(() => null)) as (TeamInviteItem & { message?: string }) | null;

      if (!res.ok) {
        window.alert(payload?.message || "Não foi possível enviar o convite.");
        return;
      }

      if (payload?._id) {
        setTeamInvites((prev) => {
          const existingIndex = prev.findIndex((invite) => invite._id === payload._id);
          if (existingIndex >= 0) {
            const nextInvites = [...prev];
            nextInvites[existingIndex] = payload;
            return nextInvites;
          }

          return [payload, ...prev];
        });
      }

      if (activeProjectId && selectedProject._id === activeProjectId) {
        fetchCollaborationFeed(activeProjectId, { silent: true });
      }

      window.alert("Convite enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao convidar membro:", error);
      window.alert("Erro ao enviar convite. Tente novamente.");
    } finally {
      setIsInvitingMember(false);
    }
  };

  const handleCancelInvite = async (
    inviteId: string,
    status: TeamInviteStatus,
    inviteEmail: string,
    projectId: string,
  ) => {
    const confirmationMessage =
      status === "accepted"
        ? "Remover este membro do projeto?"
        : status === "declined"
          ? "Remover este registro de convite?"
          : "Cancelar este convite pendente?";
    if (!window.confirm(confirmationMessage)) return;

    setCancelingInviteId(inviteId);
    try {
      const res = await fetch(apiUrl(`/api/team/invites/${inviteId}`), {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!res.ok) {
        window.alert(payload?.message || "Não foi possível cancelar o convite.");
        return;
      }

      setTeamInvites((prev) =>
        status === "accepted"
          ? prev.filter(
              (invite) =>
                !(
                  invite.email === inviteEmail &&
                  getInviteProjectId(invite) === projectId
                ),
            )
          : prev.filter((invite) => invite._id !== inviteId),
      );
      if (activeProjectId && projectId === activeProjectId) {
        fetchCollaborationFeed(activeProjectId, { silent: true });
      }
      window.alert(
        payload?.message ||
          (status === "accepted"
            ? "Membro removido do projeto com sucesso."
            : "Convite removido com sucesso."),
      );
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      window.alert("Erro ao cancelar convite. Tente novamente.");
    } finally {
      setCancelingInviteId(null);
    }
  };

  const handleRespondToInvite = async (
    inviteId: string,
    status: "accepted" | "declined",
  ) => {
    setRespondingInviteId(inviteId);
    try {
      const res = await fetch(apiUrl(`/api/team/invites/${inviteId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      const payload = (await res
        .json()
        .catch(() => null)) as (ReceivedTeamInviteItem & { message?: string }) | null;

      if (!res.ok) {
        window.alert(payload?.message || "Não foi possível responder o convite.");
        return;
      }

      setReceivedTeamInvites((prev) =>
        prev.map((invite) =>
          invite._id === inviteId
            ? { ...invite, status: payload?.status || status }
            : invite,
        ),
      );

      window.alert(
        status === "accepted"
          ? "Convite aceito com sucesso."
          : "Convite recusado com sucesso.",
      );
      const relatedProjectId = payload ? getInviteProjectId(payload) : "";
      if (activeProjectId && relatedProjectId === activeProjectId) {
        fetchCollaborationFeed(activeProjectId, { silent: true });
      }
    } catch (error) {
      console.error("Erro ao responder convite:", error);
      window.alert("Erro ao responder convite. Tente novamente.");
    } finally {
      setRespondingInviteId(null);
    }
  };

  const handlePostComment = async () => {
    const content = commentDraft.trim();
    if (!activeProjectId) return;
    if (!content) {
      window.alert("Escreva um comentário para publicar.");
      return;
    }

    setIsPostingComment(true);
    try {
      const res = await fetch(
        apiUrl(`/api/collaboration/projects/${activeProjectId}/comments`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            taskId: commentTaskId || null,
          }),
          credentials: "include",
        },
      );
      const payload = (await res.json().catch(() => null)) as
        | (CollaborationItem & { message?: string })
        | null;
      if (!res.ok) {
        window.alert(payload?.message || "Não foi possível enviar o comentário.");
        return;
      }

      if (payload?._id) {
        setCollaborationComments((prev) => [payload, ...prev].slice(0, 40));
      }

      setCommentDraft("");
      setCommentTaskId("");
      fetchCollaborationFeed(activeProjectId, { silent: true });
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      window.alert("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(
        apiUrl(`/api/collaboration/notifications/${notificationId}/read`),
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!res.ok) return;
      const payload = (await res.json().catch(() => null)) as CollaborationItem | null;
      if (!payload) return;
      setCollaborationNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? payload : notification,
        ),
      );
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
    }
  };

  const openProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView("tasks");
  };

  const persistTasksBoard = async (
    updatedTasks: TaskItem[],
    previousTasks: TaskItem[],
  ) => {
    const prevById = new Map(previousTasks.map((t) => [t._id, t]));
    const changed = updatedTasks.filter((t) => {
      const prev = prevById.get(t._id);
      return (
        !prev ||
        prev.status !== t.status ||
        (prev.order ?? -1) !== (t.order ?? -1)
      );
    });
    if (!changed.length) return;
    const responses = await Promise.all(
      changed.map((t) =>
        fetch(apiUrl(`/api/tasks/${t._id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: t.status, order: t.order ?? 0 }),
          credentials: "include",
        }),
      ),
    );
    if (responses.some((r) => !r.ok))
      throw new Error("Não foi possível persistir o quadro Kanban.");
  };

  const handleTaskDragStart = (
    e: React.DragEvent<HTMLElement>,
    taskId: string,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleTaskDragOverTask = (
    e: React.DragEvent<HTMLElement>,
    taskStatus: TaskStatus,
    taskId: string,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    if (taskId !== dragOverTaskId || taskStatus !== dragOverStatus) {
      setDragOverTaskId(taskId);
      setDragOverStatus(taskStatus);
    }
  };

  const handleTaskDragOverColumn = (
    e: React.DragEvent<HTMLElement>,
    taskStatus: TaskStatus,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    if (taskStatus !== dragOverStatus || dragOverTaskId !== null) {
      setDragOverStatus(taskStatus);
      setDragOverTaskId(null);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverStatus(null);
  };

  const handleTaskDrop = async (
    e: React.DragEvent<HTMLElement>,
    targetStatus: TaskStatus,
    targetTaskId: string | null = null,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const previousTasks = tasks;
    const reorderedTasks = moveTaskInBoard(
      tasks,
      draggedTaskId,
      targetStatus,
      targetTaskId,
    );
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverStatus(null);
    if (!reorderedTasks || !activeProjectId) return;
    setTasks(reorderedTasks);
    setIsReorderingTasks(true);
    try {
      await persistTasksBoard(reorderedTasks, previousTasks);
      fetchCollaborationFeed(activeProjectId, { silent: true });
    } catch (err) {
      console.error("Erro ao guardar Kanban:", err);
      fetchTasks(activeProjectId);
    } finally {
      setIsReorderingTasks(false);
    }
  };

  // ── Loading state ──
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4a044e]">
            <FolderKanban size={20} className="text-white" />
          </div>
          <Loader2 className="animate-spin text-fuchsia-400" size={24} />
        </div>
      </div>
    );

  if (!user) return null;

  // ── Shared styles ──
  const sectionTitle =
    "font-syne text-2xl font-extrabold tracking-tight text-white";
  const sectionSubtitle = "font-mono-dm text-xs text-white/30 mt-1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .task-card { transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s, transform 0.15s; }
        .task-card:hover { transform: translateY(-1px); }

        .project-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(74,4,78,0.2); }

        .btn-fuchsia { transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s; }
        .btn-fuchsia:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 20px rgba(74,4,78,0.4); }
        .btn-fuchsia:active { transform: scale(0.97); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* Kanban horizontal scroll on mobile */
        .kanban-board {
          display: grid;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .kanban-board { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 1023px) {
          .kanban-board {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            gap: 0.75rem;
          }
          .kanban-board::-webkit-scrollbar { display: none; }
          .kanban-col {
            min-width: 280px;
            max-width: 85vw;
            scroll-snap-align: start;
            flex-shrink: 0;
          }
        }

        /* Task action buttons always visible on touch */
        @media (hover: none) {
          .task-actions { opacity: 1 !important; }
          .task-card:hover { transform: none; }
        }

        /* Ensure touch targets are large enough */
        @media (max-width: 767px) {
          .btn-fuchsia { min-height: 44px; }
        }
      `}</style>

      <div className="font-syne flex min-h-screen bg-[#0d0d0f] text-white">
        <div className="grid-bg flex min-h-screen w-full">
          {/* ── SIDEBAR desktop ── */}
          <Sidebar
            user={user}
            onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          {/* ── MOBILE NAV ── */}
          <MobileNav
            user={user}
            onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentView={currentView}
            setCurrentView={setCurrentView}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          {/* ── MAIN ── */}
          <main className="flex-1 min-h-screen overflow-y-auto md:h-screen px-4 pt-20 pb-28 md:pt-0 md:pb-8 md:px-10 md:py-8">
            <div className="mx-auto max-w-6xl">
              {/* ════════════════════════════
                  VIEW: PROJECTS
              ════════════════════════════ */}
              {currentView === "projects" && (
                <>
                  {/* Header */}
                  <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                        <span className="h-px w-4 bg-fuchsia-400/30" />
                        área de trabalho
                      </div>
                      <h1 className={sectionTitle}>Meus Projetos</h1>
                      <p className={sectionSubtitle}>
                        Bem-vindo, {user.fullName}. Selecione ou crie um
                        projeto.
                      </p>
                    </div>
                    <button
                      onClick={openCreateProjectModal}
                      className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-3 text-sm font-bold text-white"
                    >
                      <Plus size={16} /> Novo Projeto
                    </button>
                  </div>

                  {/* Project grid */}
                  {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] py-20 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                        <FolderKanban size={24} className="text-white/20" />
                      </div>
                      <p className="font-mono-dm text-xs text-white/25 uppercase tracking-widest mb-4">
                        Nenhum projeto ainda
                      </p>
                      <button
                        onClick={openCreateProjectModal}
                        className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-4 py-2.5 text-sm font-bold text-white"
                      >
                        <Plus size={14} /> Criar primeiro projeto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {projects.map((proj, index: number) => {
                        const accent = cardAccents[index % cardAccents.length];
                        const canManageProject =
                          proj.isOwner || proj.accessRole === "admin";
                        const projectRole = normalizeProjectRole(proj.accessRole);
                        return (
                          <div
                            key={proj._id}
                            onClick={() => openProject(proj._id)}
                            className="project-card group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131316]"
                          >
                            {/* Top accent bar */}
                            <div className={`h-[3px] w-full ${accent}`} />

                            <div className="p-5">
                              <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white font-extrabold text-lg ${accent}`}
                                  >
                                    {proj.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white truncate max-w-[160px]">
                                      {proj.name}
                                    </h3>
                                    <div className="font-mono-dm mt-0.5 flex items-center gap-1 text-[10px] text-white/25">
                                      <Calendar size={9} />
                                      {formatDate(proj.createdAt)}
                                    </div>
                                    <div className="font-mono-dm mt-1 inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/30">
                                      {projectRoleLabel[projectRole]}
                                    </div>
                                  </div>
                                </div>
                                {canManageProject && (
                                  <button
                                    onClick={(e) =>
                                      handleDeleteProject(proj._id, e)
                                    }
                                    className="rounded-lg p-1.5 text-white/15 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-white/25 line-clamp-2 mb-5">
                                Clique para gerenciar as tarefas deste projeto.
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="font-mono-dm text-[10px] text-white/15 uppercase tracking-wider">
                                  acesso rápido
                                </span>
                                <span className="font-mono-dm text-[10px] text-fuchsia-400/50 transition-all group-hover:text-fuchsia-400 group-hover:translate-x-0.5">
                                  Abrir →
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ════════════════════════════
                  VIEW: TASKS / KANBAN
              ════════════════════════════ */}
              {currentView === "tasks" && activeProjectId && (
                <>
                  {/* Back */}
                  <button
                    onClick={() => setCurrentView("projects")}
                    className="mb-8 group inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/35 transition-all hover:border-white/[0.12] hover:text-white/60"
                  >
                    <ArrowLeft
                      size={13}
                      className="transition-transform group-hover:-translate-x-0.5"
                    />
                    Voltar aos projetos
                  </button>

                  {/* Header */}
                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                        <span className="h-px w-4 bg-fuchsia-400/30" />
                        kanban
                      </div>
                      <h1 className={sectionTitle}>{activeProject?.name}</h1>
                      <p className={sectionSubtitle}>
                        Arraste tarefas entre colunas para atualizar o status.
                      </p>
                      {!canEditActiveProjectTasks && (
                        <p className="font-mono-dm mt-2 text-[10px] uppercase tracking-[0.12em] text-amber-400/70">
                          Acesso somente leitura
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isReorderingTasks && (
                        <span className="font-mono-dm inline-flex items-center gap-1.5 text-[10px] text-fuchsia-400/50">
                          <Loader2 size={12} className="animate-spin" />{" "}
                          Salvando…
                        </span>
                      )}
                      {canEditActiveProjectTasks && (
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setIsTaskModalOpen(true);
                          }}
                          className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-3 text-sm font-bold text-white"
                        >
                          <Plus size={16} /> Nova Tarefa
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Kanban board */}
                  <div className="kanban-board">
                    {kanbanColumns.map((column) => {
                      const columnTasks = getTasksByStatus(
                        tasks,
                        column.status,
                      );
                      const isColDragOver =
                        dragOverStatus === column.status && !dragOverTaskId;

                      return (
                        <div
                          key={column.status}
                          onDragOver={(e) =>
                            canEditActiveProjectTasks &&
                            handleTaskDragOverColumn(e, column.status)
                          }
                          onDrop={(e) =>
                            canEditActiveProjectTasks &&
                            handleTaskDrop(e, column.status)
                          }
                          className={`kanban-col rounded-2xl border bg-[#131316] transition-all ${
                            isColDragOver
                              ? `border-[#4a044e]/50 ring-1 ring-[#4a044e]/20`
                              : "border-white/[0.06]"
                          }`}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${column.dot}`}
                              />
                              <span className="font-mono-dm text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                                {column.label}
                              </span>
                            </div>
                            <span
                              className={`font-mono-dm rounded-full border px-2 py-0.5 text-[10px] font-medium ${column.ring} ${column.accent}`}
                            >
                              {columnTasks.length}
                            </span>
                          </div>

                          {/* Tasks */}
                          <div className="min-h-[260px] space-y-2 p-3">
                            {columnTasks.length > 0 ? (
                              columnTasks.map((task) => {
                                const isDragging = draggedTaskId === task._id;
                                const isDragOver =
                                  dragOverTaskId === task._id &&
                                  draggedTaskId !== task._id;
                                const priorityKey: TaskPriority =
                                  task.priority && priorityMeta[task.priority]
                                    ? task.priority
                                    : "medium";
                                const taskPriority = priorityMeta[priorityKey];
                                const normalizedAssignee = task.assignee?.trim();
                                const checklistTotal = Array.isArray(task.checklist)
                                  ? task.checklist.length
                                  : 0;
                                const checklistDone =
                                  checklistTotal > 0
                                    ? task.checklist!.filter((item) => item.done)
                                        .length
                                    : 0;
                                const hasDueDate = Boolean(task.dueDate);
                                const parsedDueDate = hasDueDate
                                  ? new Date(task.dueDate as string)
                                  : null;
                                const isDueDateValid = Boolean(
                                  parsedDueDate &&
                                    !Number.isNaN(parsedDueDate.getTime()),
                                );
                                const dueDateDeadlineTs =
                                  parsedDueDate && isDueDateValid
                                    ? new Date(parsedDueDate).setHours(
                                        23,
                                        59,
                                        59,
                                        999,
                                      )
                                    : null;
                                const isOverdue = Boolean(
                                  dueDateDeadlineTs &&
                                    task.status !== "done" &&
                                    dueDateDeadlineTs < Date.now(),
                                );

                                return (
                                  <article
                                    key={task._id}
                                    draggable={canEditActiveProjectTasks}
                                    onDragStart={(e) =>
                                      canEditActiveProjectTasks &&
                                      handleTaskDragStart(e, task._id)
                                    }
                                    onDragOver={(e) => {
                                      if (!canEditActiveProjectTasks) return;
                                      e.stopPropagation();
                                      handleTaskDragOverTask(
                                        e,
                                        column.status,
                                        task._id,
                                      );
                                    }}
                                    onDrop={(e) => {
                                      if (!canEditActiveProjectTasks) return;
                                      e.stopPropagation();
                                      handleTaskDrop(
                                        e,
                                        column.status,
                                        task._id,
                                      );
                                    }}
                                    onDragEnd={() =>
                                      canEditActiveProjectTasks &&
                                      handleTaskDragEnd()
                                    }
                                    className={`task-card group ${
                                      canEditActiveProjectTasks
                                        ? "cursor-move"
                                        : "cursor-default"
                                    } rounded-xl border bg-[#0d0d0f] p-4 ${
                                      isDragging
                                        ? "opacity-50 border-[#4a044e]/40"
                                        : isDragOver
                                          ? "border-[#4a044e]/60 ring-1 ring-[#4a044e]/20"
                                          : "border-white/[0.06] hover:border-white/[0.12]"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <GripVertical
                                        size={14}
                                        className="mt-0.5 shrink-0 text-white/10"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <h3
                                          className={`text-sm font-bold leading-snug ${
                                            task.status === "done"
                                              ? "line-through text-white/20"
                                              : "text-white/80"
                                          }`}
                                        >
                                          {task.title}
                                        </h3>
                                        {task.description && (
                                          <p className="mt-1.5 text-xs leading-relaxed text-white/25 line-clamp-2">
                                            {task.description}
                                          </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                          <span
                                            className={`font-mono-dm inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${taskPriority.badgeClass}`}
                                          >
                                            {taskPriority.label}
                                          </span>
                                          {isDueDateValid && (
                                            <span
                                              className={`font-mono-dm inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                                                isOverdue
                                                  ? "border-red-400/30 bg-red-400/10 text-red-300"
                                                  : "border-white/[0.08] bg-white/[0.04] text-white/40"
                                              }`}
                                            >
                                              Prazo {formatDate(task.dueDate as string)}
                                            </span>
                                          )}
                                          {normalizedAssignee && (
                                            <span className="font-mono-dm inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                                              Resp. {normalizedAssignee}
                                            </span>
                                          )}
                                          {checklistTotal > 0 && (
                                            <span className="font-mono-dm inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                                              Checklist {checklistDone}/
                                              {checklistTotal}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    {canEditActiveProjectTasks && (
                                      <div className="task-actions mt-3 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                          onClick={() => {
                                            setEditingTask(task);
                                            setIsTaskModalOpen(true);
                                          }}
                                          className="rounded-lg p-2 text-white/20 transition-colors hover:bg-fuchsia-400/10 hover:text-fuchsia-400 active:bg-fuchsia-400/10 active:text-fuchsia-400"
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteTask(task._id)
                                          }
                                          className="rounded-lg p-2 text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 active:bg-red-400/10 active:text-red-400"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </article>
                                );
                              })
                            ) : (
                              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/[0.05]">
                                <p className="font-mono-dm text-[10px] uppercase tracking-wider text-white/15">
                                  {column.emptyLabel}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state */}
                  {tasks.length === 0 && (
                    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] py-16 text-center">
                      <p className="font-mono-dm text-xs uppercase tracking-widest text-white/20 mb-4">
                        Nenhuma tarefa neste projeto ainda
                      </p>
                      {canEditActiveProjectTasks && (
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setIsTaskModalOpen(true);
                          }}
                          className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-4 py-2.5 text-sm font-bold text-white"
                        >
                          <Plus size={14} /> Adicionar primeira tarefa
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-8 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                    <section className="rounded-2xl border border-white/[0.06] bg-[#131316] p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-mono-dm mb-1 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-fuchsia-400/60">
                            <MessageSquareText size={12} />
                            Discussão
                          </div>
                          <p className="text-sm text-white/45">
                            Comentários do projeto com menções para notificar o time.
                          </p>
                        </div>
                        <span className="font-mono-dm rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/40">
                          {collaborationComments.length} comentários
                        </span>
                      </div>

                      <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#0d0d0f] p-3">
                        <textarea
                          rows={3}
                          value={commentDraft}
                          onChange={(event) => setCommentDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                              event.preventDefault();
                              if (!isPostingComment) handlePostComment();
                            }
                          }}
                          placeholder="Comente algo e mencione pessoas com @email..."
                          className="w-full resize-none border-none bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
                        />
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <select
                              value={commentTaskId}
                              onChange={(event) => setCommentTaskId(event.target.value)}
                              className="font-mono-dm rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-white/50 outline-none"
                            >
                              <option value="">Projeto (sem tarefa)</option>
                              {tasks.map((task) => (
                                <option
                                  key={`comment-task-${task._id}`}
                                  value={task._id}
                                  className="bg-[#131316] text-white"
                                >
                                  {task.title}
                                </option>
                              ))}
                            </select>
                            <span className="font-mono-dm inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/25">
                              <AtSign size={11} />
                              Use @email para menções
                            </span>
                          </div>
                          <button
                            onClick={handlePostComment}
                            disabled={isPostingComment}
                            className="btn-fuchsia inline-flex items-center justify-center gap-2 rounded-lg bg-[#4a044e] px-3.5 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isPostingComment ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <SendHorizontal size={13} />
                            )}
                            {isPostingComment ? "Enviando..." : "Publicar"}
                          </button>
                        </div>
                      </div>

                      {isLoadingCollaboration ? (
                        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                          <span className="font-mono-dm inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
                            <Loader2 size={12} className="animate-spin" />
                            Carregando discussão...
                          </span>
                        </div>
                      ) : collaborationComments.length > 0 ? (
                        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
                          {collaborationComments.map((comment) => {
                            const authorName =
                              comment.actor?.fullName || comment.actor?.email || "Membro";
                            const linkedTask =
                              comment.task && typeof comment.task !== "string"
                                ? comment.task.title
                                : "";

                            return (
                              <article
                                key={comment._id}
                                className="rounded-xl border border-white/[0.06] bg-[#0d0d0f] p-3.5"
                              >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white/80">
                                      {authorName}
                                    </p>
                                    <p className="font-mono-dm text-[10px] text-white/30">
                                      {formatDateTime(comment.createdAt)}
                                    </p>
                                  </div>
                                  {linkedTask && (
                                    <span className="font-mono-dm rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fuchsia-300">
                                      {linkedTask}
                                    </span>
                                  )}
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                                  {renderMentions(comment.content)}
                                </p>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                          <span className="font-mono-dm text-[10px] uppercase tracking-wider text-white/20">
                            Ainda sem comentários neste projeto.
                          </span>
                        </div>
                      )}
                    </section>

                    <div className="space-y-4">
                      <section className="rounded-2xl border border-white/[0.06] bg-[#131316] p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-mono-dm inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-fuchsia-400/60">
                            <History size={12} />
                            Histórico
                          </div>
                          <span className="font-mono-dm text-[10px] uppercase tracking-wider text-white/25">
                            últimas ações
                          </span>
                        </div>
                        {isLoadingCollaboration ? (
                          <div className="flex h-[148px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                            <Loader2 size={14} className="animate-spin text-white/30" />
                          </div>
                        ) : collaborationActivities.length > 0 ? (
                          <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                            {collaborationActivities.slice(0, 12).map((activity) => (
                              <article
                                key={activity._id}
                                className="rounded-lg border border-white/[0.05] bg-[#0d0d0f] p-2.5"
                              >
                                <p className="text-xs leading-relaxed text-white/55">
                                  {activity.content}
                                </p>
                                <p className="font-mono-dm mt-1 text-[10px] text-white/25">
                                  {formatDateTime(activity.createdAt)}
                                </p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-[148px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                            <p className="font-mono-dm text-[10px] uppercase tracking-wider text-white/20">
                              Nenhuma atividade registrada.
                            </p>
                          </div>
                        )}
                      </section>

                      <section className="rounded-2xl border border-white/[0.06] bg-[#131316] p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-mono-dm inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-fuchsia-400/60">
                            <Bell size={12} />
                            Notificações
                          </div>
                          <span className="font-mono-dm rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                            {unreadNotificationCount} não lidas
                          </span>
                        </div>
                        {isLoadingCollaboration ? (
                          <div className="flex h-[148px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                            <Loader2 size={14} className="animate-spin text-white/30" />
                          </div>
                        ) : collaborationNotifications.length > 0 ? (
                          <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                            {collaborationNotifications.map((notification) => (
                              <article
                                key={notification._id}
                                className={`rounded-lg border p-2.5 ${
                                  notification.readAt
                                    ? "border-white/[0.05] bg-[#0d0d0f]"
                                    : "border-fuchsia-400/20 bg-fuchsia-400/[0.08]"
                                }`}
                              >
                                <p className="text-xs leading-relaxed text-white/65">
                                  {notification.content}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between gap-3">
                                  <p className="font-mono-dm text-[10px] text-white/30">
                                    {formatDateTime(notification.createdAt)}
                                  </p>
                                  {!notification.readAt && (
                                    <button
                                      onClick={() =>
                                        handleMarkNotificationAsRead(notification._id)
                                      }
                                      className="font-mono-dm inline-flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-white/45 transition-colors hover:text-white"
                                    >
                                      <Check size={11} />
                                      Marcar lida
                                    </button>
                                  )}
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-[148px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                            <p className="font-mono-dm text-[10px] uppercase tracking-wider text-white/20">
                              Sem notificações para você.
                            </p>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </>
              )}

              {/* ════════════════════════════
                  VIEW: TEAM
              ════════════════════════════ */}
              {currentView === "team" && (
                <>
                  <div className="mb-8">
                    <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                      <span className="h-px w-4 bg-fuchsia-400/30" />
                      colaboração
                    </div>
                    <h1 className={sectionTitle}>Membros da Equipe</h1>
                    <p className={sectionSubtitle}>
                      Gerencie quem tem acesso aos seus projetos.
                    </p>
                  </div>

                  <div className="overflow-x-auto overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131316]">
                    <table className="w-full min-w-[580px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["Membro", "Função", "Status", ""].map((h) => (
                            <th
                              key={h}
                              className="font-mono-dm px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-white/20"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4a044e] text-sm font-bold text-white">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white/80">
                                  {user.fullName}
                                </div>
                                <div className="font-mono-dm text-[10px] text-white/25">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono-dm text-[11px] text-white/30">
                              Proprietário
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono-dm inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-400">
                              <span className="h-1 w-1 rounded-full bg-emerald-400" />
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => setIsSettingsOpen(true)}
                              className="rounded-lg p-2 text-white/15 transition-colors hover:bg-white/[0.04] hover:text-white/40"
                            >
                              <Settings size={15} />
                            </button>
                          </td>
                        </tr>

                        {(isLoadingTeamInvites ||
                          isLoadingReceivedTeamInvites) && (
                          <tr>
                            <td colSpan={4} className="px-6 py-6 text-center">
                              <span className="font-mono-dm inline-flex items-center gap-2 text-[11px] text-white/30">
                                <Loader2 size={12} className="animate-spin" />
                                Carregando convites...
                              </span>
                            </td>
                          </tr>
                        )}

                        {!isLoadingReceivedTeamInvites &&
                          receivedTeamInvites.length > 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-3">
                                <span className="font-mono-dm text-[10px] uppercase tracking-[0.15em] text-white/25">
                                  Convites recebidos
                                </span>
                              </td>
                            </tr>
                          )}

                        {!isLoadingReceivedTeamInvites &&
                          receivedTeamInvites.map((invite) => {
                            const statusMeta =
                              inviteStatusMap[invite.status] ||
                              inviteStatusMap.pending;
                            const inviterName =
                              invite.invitedBy?.fullName || "Usuário";
                            const inviterEmail =
                              invite.invitedBy?.email || "sem e-mail";
                            const inviteRole = normalizeProjectRole(invite.role);
                            const inviteProjectName = getInviteProjectName(invite);

                            return (
                              <tr
                                key={`received-${invite._id}`}
                                className="transition-colors hover:bg-white/[0.02]"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-white/80">
                                      {inviterName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-white/70">
                                        {inviterName}
                                      </div>
                                      <div className="font-mono-dm text-[10px] text-white/25">
                                        {inviterEmail}
                                      </div>
                                      <div className="font-mono-dm text-[10px] text-white/20">
                                        Convite recebido em{" "}
                                        {formatDate(invite.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="font-mono-dm text-[11px] text-white/30">
                                    {projectRoleLabel[inviteRole]} em {inviteProjectName}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span
                                    className={`font-mono-dm inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${statusMeta.accent}`}
                                  >
                                    <span
                                      className={`h-1 w-1 rounded-full ${statusMeta.dot}`}
                                    />
                                    {statusMeta.label}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  {invite.status !== "accepted" && (
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleRespondToInvite(
                                            invite._id,
                                            "accepted",
                                          )
                                        }
                                        disabled={
                                          respondingInviteId === invite._id
                                        }
                                        className="rounded-lg p-2 text-emerald-400/70 transition-colors hover:bg-emerald-400/10 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        title="Aceitar convite"
                                      >
                                        {respondingInviteId === invite._id ? (
                                          <Loader2
                                            size={13}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Check size={13} />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRespondToInvite(
                                            invite._id,
                                            "declined",
                                          )
                                        }
                                        disabled={
                                          respondingInviteId === invite._id
                                        }
                                        className="rounded-lg p-2 text-red-400/70 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        title="Recusar convite"
                                      >
                                        {respondingInviteId === invite._id ? (
                                          <Loader2
                                            size={13}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <X size={13} />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        {!isLoadingTeamInvites &&
                          teamInvites.length > 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-3">
                                <span className="font-mono-dm text-[10px] uppercase tracking-[0.15em] text-white/25">
                                  Convites enviados
                                </span>
                              </td>
                            </tr>
                          )}

                        {!isLoadingTeamInvites &&
                          teamInvites.map((invite) => {
                            const statusMeta =
                              inviteStatusMap[invite.status] ||
                              inviteStatusMap.pending;
                            const inviteRole = normalizeProjectRole(invite.role);
                            const inviteProjectName = getInviteProjectName(invite);

                            return (
                              <tr
                                key={invite._id}
                                className="transition-colors hover:bg-white/[0.02]"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-white/80">
                                      {invite.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-white/70">
                                        {invite.email}
                                      </div>
                                      <div className="font-mono-dm text-[10px] text-white/25">
                                        Convite enviado em{" "}
                                        {formatDate(invite.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="font-mono-dm text-[11px] text-white/30">
                                    {projectRoleLabel[inviteRole]} em {inviteProjectName}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span
                                    className={`font-mono-dm inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${statusMeta.accent}`}
                                  >
                                    <span
                                      className={`h-1 w-1 rounded-full ${statusMeta.dot}`}
                                    />
                                    {statusMeta.label}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  {["pending", "accepted", "declined"].includes(
                                    invite.status,
                                  ) && (
                                    <button
                                      onClick={() =>
                                        handleCancelInvite(
                                          invite._id,
                                          invite.status,
                                          invite.email,
                                          getInviteProjectId(invite),
                                        )
                                      }
                                      disabled={cancelingInviteId === invite._id}
                                      className="rounded-lg p-2 text-white/15 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                                      title={
                                        invite.status === "accepted"
                                          ? "Remover membro"
                                          : invite.status === "declined"
                                            ? "Remover registro"
                                            : "Cancelar convite"
                                      }
                                    >
                                      {cancelingInviteId === invite._id ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2 size={14} />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <p className="font-mono-dm mb-5 text-xs text-white/20">
                              Deseja colaborar com outros usuários?
                            </p>
                            <button
                              onClick={handleInviteMember}
                              disabled={isInvitingMember}
                              className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isInvitingMember ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Plus size={14} />
                              )}
                              {isInvitingMember
                                ? "Enviando..."
                                : "Convidar membro"}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <NewProjectModal
        key={isProjectModalOpen ? "project-modal-open" : "project-modal-closed"}
        isOpen={isProjectModalOpen}
        onClose={() => {
          if (isCreatingProject) return;
          setIsProjectModalOpen(false);
          setProjectCreationError("");
        }}
        onCreate={handleCreateProject}
        isLoading={isCreatingProject}
        error={projectCreationError}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          if (!activeProjectId) return;
          fetchTasks(activeProjectId);
          fetchCollaborationFeed(activeProjectId, { silent: true });
        }}
        projectId={activeProjectId}
        taskToEdit={editingTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSuccess={fetchUserData}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </>
  );
}
