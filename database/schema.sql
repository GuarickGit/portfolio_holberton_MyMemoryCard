--
-- PostgreSQL database dump
--

\restrict kxsID5GMLXkLwMw07syB7Z1l0JfMVLVKINglvaKEOgPHaUCkllwSxVHimtvdqBL

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: collection_status; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.collection_status AS ENUM (
    'wishlist',
    'playing',
    'completed',
    'abandoned',
    'not_started'
);


ALTER TYPE public.collection_status OWNER TO admin;

--
-- Name: target_type; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.target_type AS ENUM (
    'review',
    'memory'
);


ALTER TYPE public.target_type OWNER TO admin;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin',
    'moderator'
);


ALTER TYPE public.user_role OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.achievements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    icon_url text
);


ALTER TABLE public.achievements OWNER TO admin;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.collections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    game_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    user_rating integer,
    status public.collection_status DEFAULT 'not_started'::public.collection_status NOT NULL,
    CONSTRAINT collections_user_rating_check CHECK (((user_rating >= 1) AND (user_rating <= 5)))
);


ALTER TABLE public.collections OWNER TO admin;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    target_type public.target_type NOT NULL,
    target_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO admin;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.follows (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT follows_check CHECK ((follower_id <> following_id))
);


ALTER TABLE public.follows OWNER TO admin;

--
-- Name: games; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.games (
    id integer NOT NULL,
    rawg_id integer NOT NULL,
    name character varying(255) NOT NULL,
    background_image text,
    released date,
    rating numeric(3,2),
    platforms jsonb,
    genres jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cover_url text
);


ALTER TABLE public.games OWNER TO admin;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_id_seq OWNER TO admin;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: memories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.memories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    game_id integer NOT NULL,
    content text,
    created_at timestamp without time zone DEFAULT now(),
    title character varying(100),
    spoiler boolean DEFAULT false
);


ALTER TABLE public.memories OWNER TO admin;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    game_id integer NOT NULL,
    rating integer,
    content text,
    created_at timestamp without time zone DEFAULT now(),
    title character varying(100),
    spoiler boolean DEFAULT false,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO admin;

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    unlocked_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_achievements OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    bio text,
    avatar_url text DEFAULT 'https://i.imgur.com/hwcUBwL.png'::text,
    banner_url text DEFAULT 'https://i.imgur.com/VC6b3KL.jpeg'::text,
    exp integer DEFAULT 0,
    level integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now(),
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: follows follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: games games_rawg_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_rawg_id_key UNIQUE (rawg_id);


--
-- Name: memories memories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.memories
    ADD CONSTRAINT memories_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_follows_following; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_follows_following ON public.follows USING btree (following_id);


--
-- Name: idx_games_rawg_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_games_rawg_id ON public.games USING btree (rawg_id);


--
-- Name: collections collections_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: collections collections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: memories memories_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.memories
    ADD CONSTRAINT memories_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: memories memories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.memories
    ADD CONSTRAINT memories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kxsID5GMLXkLwMw07syB7Z1l0JfMVLVKINglvaKEOgPHaUCkllwSxVHimtvdqBL

