# Database ER Diagram

Generated from the current schema (`backend/src/database/migrations`) — see also
[`db/schema.sql`](../db/schema.sql) for the literal `CREATE TABLE` statements. Every table except
`notification` and `activity` has a soft-delete `deletedAt` column (TypeORM excludes soft-deleted rows
from every query automatically); audit fields are `createdAt`/`updatedAt` on all but `activity` and
`file_asset`, which are append-only/immutable and only track `createdAt`.

```mermaid
erDiagram
    ROLE ||--o{ USER : "has"
    USER ||--o{ PROJECT : "owns"
    USER }o--o{ PROJECT : "is a member of"
    USER ||--o{ TASK : "is assignee of"
    USER ||--o{ TASK : "is reporter of"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ COMMENT : "authors"
    TASK ||--o{ COMMENT : "has"
    PROJECT ||--o{ COMMENT : "has"
    USER }o--o{ COMMENT : "is mentioned in"
    USER ||--o{ FILE_ASSET : "uploads"
    PROJECT ||--o{ FILE_ASSET : "has"
    TASK ||--o{ FILE_ASSET : "has"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ ACTIVITY : "performs"

    ROLE {
        int id PK
        string name UK "unique among non-deleted rows"
        string description
        string[] permissions "simple-array, e.g. manage_tasks"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    USER {
        int id PK
        string fullName
        string email UK "unique among non-deleted rows"
        string passwordHash "select:false"
        string avatarUrl "profile picture"
        string jobTitle
        string mobile
        enum status "ACTIVE | INACTIVE"
        int roleId FK
        string refreshTokenHash "select:false"
        string passwordResetTokenHash "select:false"
        timestamp passwordResetExpiresAt "select:false"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    PROJECT {
        int id PK
        string name
        text description
        enum status "ON_TRACK | AT_RISK | DELAYED | COMPLETED | ON_HOLD"
        date startDate
        date endDate
        int ownerId FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    TASK {
        int id PK
        string title
        text description
        enum status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        enum priority "LOW | MEDIUM | HIGH"
        date dueDate
        decimal estimatedHours
        decimal actualHours
        int projectId FK
        int assigneeId FK
        int reporterId FK
        timestamp completedAt
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    COMMENT {
        int id PK
        text content
        int authorId FK
        int taskId FK "nullable - exactly one of task/project set"
        int projectId FK "nullable"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    FILE_ASSET {
        int id PK
        string originalName
        string storedFileName
        string mimeType
        int sizeBytes
        int uploadedById FK
        int projectId FK "nullable"
        int taskId FK "nullable"
        timestamp createdAt
        timestamp deletedAt
    }

    NOTIFICATION {
        int id PK
        enum type "TASK_ASSIGNED | TASK_DUE | PROJECT_UPDATE | MENTION | SYSTEM"
        string title
        string message
        boolean isRead
        string link
        int userId FK
        timestamp createdAt
    }

    ACTIVITY {
        int id PK
        enum type "TASK_CREATED | ... | USER_LOGIN | USER_LOGOUT"
        string entityType
        int entityId
        string description
        int userId FK "nullable"
        timestamp createdAt
    }
```

## Notes

- `project_members` and `comment_mentions` are plain many-to-many join tables (no extra columns),
  shown above as `}o--o{` relationships rather than separate boxes.
- Indexes: `user.email` and `role.name` are partial-unique (`WHERE "deletedAt" IS NULL`, so a
  soft-deleted row's identity can be reused); `user.status`, `project.status`, `task.status`,
  `task.priority`, `task.dueDate`, `notification.userId`, `notification.isRead`, `activity.createdAt`,
  `comment.taskId`, `comment.projectId`, `file_asset.projectId`, and `file_asset.taskId` all have
  supporting B-tree indexes for the filters/sorts the API exposes on each.
