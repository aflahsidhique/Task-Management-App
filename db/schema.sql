--
-- PostgreSQL database dump
--

\restrict cR2dUX0J6dJGIAxR3q78D4NdkM1cidnJkTnm9k2i4vj8CP1FAY7SNT2a47AWL9W

-- Dumped from database version 13.23 (Debian 13.23-1.pgdg13+1)
-- Dumped by pg_dump version 13.23 (Debian 13.23-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: activity_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_type_enum AS ENUM (
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_COMPLETED',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'FILE_UPLOADED',
    'COMMENT_ADDED',
    'COMMENT_DELETED',
    'USER_LOGIN',
    'USER_LOGOUT'
);


--
-- Name: notification_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type_enum AS ENUM (
    'TASK_ASSIGNED',
    'TASK_DUE',
    'PROJECT_UPDATE',
    'MENTION',
    'SYSTEM'
);


--
-- Name: project_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status_enum AS ENUM (
    'ON_TRACK',
    'AT_RISK',
    'DELAYED',
    'COMPLETED',
    'ON_HOLD'
);


--
-- Name: task_priority_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.task_priority_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


--
-- Name: task_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.task_status_enum AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE'
);


--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity (
    id integer NOT NULL,
    type public.activity_type_enum NOT NULL,
    "entityType" character varying NOT NULL,
    "entityId" integer NOT NULL,
    description character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


--
-- Name: activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_id_seq OWNED BY public.activity.id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "authorId" integer NOT NULL,
    "taskId" integer,
    "projectId" integer
);


--
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- Name: comment_mentions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_mentions (
    "commentId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: file_asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_asset (
    id integer NOT NULL,
    "originalName" character varying NOT NULL,
    "storedFileName" character varying NOT NULL,
    "mimeType" character varying NOT NULL,
    "sizeBytes" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "uploadedById" integer,
    "projectId" integer,
    "taskId" integer
);


--
-- Name: file_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.file_asset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.file_asset_id_seq OWNED BY public.file_asset.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    type public.notification_type_enum NOT NULL,
    title character varying NOT NULL,
    message character varying NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    link character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    status public.project_status_enum DEFAULT 'ON_TRACK'::public.project_status_enum NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "ownerId" integer
);


--
-- Name: project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    "projectId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    permissions text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    status public.task_status_enum DEFAULT 'TODO'::public.task_status_enum NOT NULL,
    priority public.task_priority_enum DEFAULT 'MEDIUM'::public.task_priority_enum NOT NULL,
    "dueDate" date,
    "estimatedHours" numeric(6,2),
    "actualHours" numeric(6,2),
    "completedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "projectId" integer,
    "assigneeId" integer,
    "reporterId" integer
);


--
-- Name: task_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.task_id_seq OWNED BY public.task.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    "fullName" character varying NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying NOT NULL,
    "avatarUrl" character varying,
    "jobTitle" character varying,
    mobile character varying,
    status public.user_status_enum DEFAULT 'ACTIVE'::public.user_status_enum NOT NULL,
    "refreshTokenHash" character varying,
    "passwordResetTokenHash" character varying,
    "passwordResetExpiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "roleId" integer
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity ALTER COLUMN id SET DEFAULT nextval('public.activity_id_seq'::regclass);


--
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- Name: file_asset id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_asset ALTER COLUMN id SET DEFAULT nextval('public.file_asset_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: project id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: task id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task ALTER COLUMN id SET DEFAULT nextval('public.task_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- Name: comment_mentions PK_11054ceba1bed401adbb83b8fbb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_mentions
    ADD CONSTRAINT "PK_11054ceba1bed401adbb83b8fbb" PRIMARY KEY ("commentId", "userId");


--
-- Name: activity PK_24625a1d6b1b089c8ae206fe467; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY (id);


--
-- Name: project_members PK_326b2a901eb18ac24eabc9b0581; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "PK_326b2a901eb18ac24eabc9b0581" PRIMARY KEY ("projectId", "userId");


--
-- Name: file_asset PK_4cc6688b434b7f95a9788fa5f4c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_asset
    ADD CONSTRAINT "PK_4cc6688b434b7f95a9788fa5f4c" PRIMARY KEY (id);


--
-- Name: project PK_4d68b1358bb5b766d3e78f32f57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY (id);


--
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: task PK_fb213f79ee45060ba925ecd576e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY (id);


--
-- Name: IDX_0294c9da809e60b4f2472d4c83; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0294c9da809e60b4f2472d4c83" ON public.comment_mentions USING btree ("userId");


--
-- Name: IDX_080ab397c379af09b9d2169e5b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_080ab397c379af09b9d2169e5b" ON public.notification USING btree ("isRead");


--
-- Name: IDX_08d1346ff91abba68e5a637cfd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_08d1346ff91abba68e5a637cfd" ON public.project_members USING btree ("userId");


--
-- Name: IDX_1ced25315eb974b73391fb1c81; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1ced25315eb974b73391fb1c81" ON public.notification USING btree ("userId");


--
-- Name: IDX_2fe7a278e6f08d2be55740a939; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2fe7a278e6f08d2be55740a939" ON public.task USING btree (status);


--
-- Name: IDX_390b81554c9b89631cda24db60; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_390b81554c9b89631cda24db60" ON public.task USING btree ("dueDate");


--
-- Name: IDX_3d44ccf43b8a0d6b9978affb88; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3d44ccf43b8a0d6b9978affb88" ON public."user" USING btree (status);


--
-- Name: IDX_3fc9b8d1e39258c9a395b18377; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_3fc9b8d1e39258c9a395b18377" ON public.role USING btree (name) WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_57856cedbec1fbed761154d162; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_57856cedbec1fbed761154d162" ON public.project USING btree (status);


--
-- Name: IDX_61e5bdd38addac8d6219ca102e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_61e5bdd38addac8d6219ca102e" ON public.comment USING btree ("projectId");


--
-- Name: IDX_9214cdc405ca85155613b96bb5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9214cdc405ca85155613b96bb5" ON public.file_asset USING btree ("taskId");


--
-- Name: IDX_9fc19c95c33ef4d97d09b72ee9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9fc19c95c33ef4d97d09b72ee9" ON public.comment USING btree ("taskId");


--
-- Name: IDX_b8484c21753196991604758d3f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b8484c21753196991604758d3f" ON public.file_asset USING btree ("projectId");


--
-- Name: IDX_caa645b86d8db66739106100a2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_caa645b86d8db66739106100a2" ON public.activity USING btree ("createdAt");


--
-- Name: IDX_d0012b9482ca5b4f270e6fdb5e; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_d0012b9482ca5b4f270e6fdb5e" ON public."user" USING btree (email) WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_d19892d8f03928e5bfc7313780; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d19892d8f03928e5bfc7313780" ON public.project_members USING btree ("projectId");


--
-- Name: IDX_dc73b25397fe92549b4c41dfe5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_dc73b25397fe92549b4c41dfe5" ON public.comment_mentions USING btree ("commentId");


--
-- Name: IDX_f092f3386f10f2e2ef5b0b6ad1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f092f3386f10f2e2ef5b0b6ad1" ON public.task USING btree (priority);


--
-- Name: comment_mentions FK_0294c9da809e60b4f2472d4c835; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_mentions
    ADD CONSTRAINT "FK_0294c9da809e60b4f2472d4c835" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members FK_08d1346ff91abba68e5a637cfdb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "FK_08d1346ff91abba68e5a637cfdb" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification FK_1ced25315eb974b73391fb1c81b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: comment FK_276779da446413a0d79598d4fbd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES public."user"(id);


--
-- Name: activity FK_3571467bcbe021f66e2bdce96ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: task FK_3797a20ef5553ae87af126bc2fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: comment FK_61e5bdd38addac8d6219ca102ee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: task FK_7384988f7eeb777e44802a0baca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_7384988f7eeb777e44802a0baca" FOREIGN KEY ("assigneeId") REFERENCES public."user"(id);


--
-- Name: file_asset FK_9214cdc405ca85155613b96bb5d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_asset
    ADD CONSTRAINT "FK_9214cdc405ca85155613b96bb5d" FOREIGN KEY ("taskId") REFERENCES public.task(id) ON DELETE CASCADE;


--
-- Name: project FK_9884b2ee80eb70b7db4f12e8aed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES public."user"(id);


--
-- Name: comment FK_9fc19c95c33ef4d97d09b72ee95; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95" FOREIGN KEY ("taskId") REFERENCES public.task(id) ON DELETE CASCADE;


--
-- Name: file_asset FK_b8484c21753196991604758d3f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_asset
    ADD CONSTRAINT "FK_b8484c21753196991604758d3f0" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: user FK_c28e52f758e7bbc53828db92194; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES public.role(id);


--
-- Name: project_members FK_d19892d8f03928e5bfc7313780c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "FK_d19892d8f03928e5bfc7313780c" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task FK_d7263b567c2d0945fd5aa9ab671; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_d7263b567c2d0945fd5aa9ab671" FOREIGN KEY ("reporterId") REFERENCES public."user"(id);


--
-- Name: file_asset FK_dbae27ec45a080510e47a48ec24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_asset
    ADD CONSTRAINT "FK_dbae27ec45a080510e47a48ec24" FOREIGN KEY ("uploadedById") REFERENCES public."user"(id);


--
-- Name: comment_mentions FK_dc73b25397fe92549b4c41dfe56; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_mentions
    ADD CONSTRAINT "FK_dc73b25397fe92549b4c41dfe56" FOREIGN KEY ("commentId") REFERENCES public.comment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cR2dUX0J6dJGIAxR3q78D4NdkM1cidnJkTnm9k2i4vj8CP1FAY7SNT2a47AWL9W

