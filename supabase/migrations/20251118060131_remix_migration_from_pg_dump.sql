--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: get_comment_vibe_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_comment_vibe_count(comment_id_param uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM comment_vibes
    WHERE comment_id = comment_id_param
  );
END;
$$;


--
-- Name: get_comment_vibes_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_comment_vibes_count(post_id_param uuid) RETURNS TABLE(comment_id uuid, count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT cv.comment_id, COUNT(cv.id)::BIGINT
  FROM comment_vibes cv
  WHERE cv.post_id = post_id_param
  GROUP BY cv.comment_id;
END;
$$;


--
-- Name: update_applications_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_applications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_conversation_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_student_profile_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_student_profile_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_thread_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_thread_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.forum_threads
  SET updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_response_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_response_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query_hash text NOT NULL,
    response jsonb,
    sources jsonb,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: anonymous_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anonymous_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    interaction_type text NOT NULL,
    target_id uuid NOT NULL,
    anonymous_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    university text NOT NULL,
    country text NOT NULL,
    portal text NOT NULL,
    course text NOT NULL,
    level text NOT NULL,
    term text NOT NULL,
    deadline date NOT NULL,
    app_id text,
    fee_amount numeric(10,2) NOT NULL,
    fee_paid boolean DEFAULT false NOT NULL,
    current_status text DEFAULT 'DRAFT'::text NOT NULL,
    decision text,
    decision_date date,
    scholarship_note text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: career_paths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.career_paths (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    career_title text NOT NULL,
    description text,
    required_education text[],
    recommended_courses jsonb,
    skills_required text[],
    avg_salary_range text,
    top_companies text[],
    growth_prospects text,
    market_demand text,
    related_fields text[],
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: college_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.college_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid,
    course_name text NOT NULL,
    degree_type text,
    specialization text,
    duration text,
    fees_per_year numeric,
    total_fees numeric,
    seats_available integer,
    eligibility text,
    entrance_exams text[],
    mode_of_study text,
    department text,
    course_highlights text[],
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: college_placements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.college_placements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid,
    year integer,
    placement_percentage numeric,
    avg_package numeric,
    median_package numeric,
    highest_package numeric,
    top_recruiters text[],
    total_offers integer,
    companies_visited integer,
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: college_rankings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.college_rankings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid,
    ranking_body text,
    rank integer,
    category text,
    year integer,
    score numeric,
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: colleges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.colleges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text,
    state text,
    country text DEFAULT 'India'::text,
    university_type text,
    nirf_rank integer,
    nirf_category text,
    qs_rank integer,
    naac_grade text,
    accreditation jsonb,
    founded_year integer,
    campus_area text,
    student_count integer,
    faculty_count integer,
    image_url text,
    website text,
    contact jsonb,
    highlights text[],
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: comment_reposts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_reposts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comment_vibes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_vibes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    is_anonymous boolean DEFAULT false,
    anonymous_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    icon text,
    banner text,
    theme_color text,
    rules text[],
    is_private boolean DEFAULT false,
    profile_photo text,
    cover_photo text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    is_admin boolean DEFAULT false,
    is_moderator boolean DEFAULT false
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    name text NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: entrance_exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entrance_exams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_name text NOT NULL,
    full_name text,
    conducting_body text,
    exam_type text,
    applicable_for text[],
    exam_pattern jsonb,
    registration_dates jsonb,
    exam_dates jsonb,
    syllabus_url text,
    official_website text,
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    type text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    detail text NOT NULL
);


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    related_to text[],
    helpful_count integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    tags text[],
    related_colleges uuid[],
    related_courses text[],
    metadata jsonb,
    is_published boolean DEFAULT true,
    views_count integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    career_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    actor_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: post_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid,
    media text,
    is_anonymous boolean DEFAULT false,
    anonymous_name text,
    college text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reposts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reposts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    type text NOT NULL,
    label text NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    status text DEFAULT 'NOT_STARTED'::text NOT NULL,
    due_on date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: scholarships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scholarships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid,
    scholarship_name text NOT NULL,
    scholarship_type text,
    amount_range text,
    eligibility_criteria text,
    application_deadline date,
    website_url text,
    last_updated timestamp with time zone DEFAULT now()
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    date_of_birth date,
    gender text,
    nationality text,
    email text,
    phone text,
    phone_country_code text DEFAULT '+91'::text,
    alternate_phone text,
    profile_picture_url text,
    tenth_board text,
    tenth_percentage numeric,
    tenth_year integer,
    twelfth_board text,
    twelfth_percentage numeric,
    twelfth_stream text,
    twelfth_year integer,
    entrance_exams jsonb DEFAULT '[]'::jsonb,
    category text,
    is_pwd boolean DEFAULT false,
    pwd_type text,
    annual_family_income numeric,
    father_name text,
    father_occupation text,
    mother_name text,
    mother_occupation text,
    guardian_name text,
    guardian_relation text,
    permanent_address text,
    city text,
    state text,
    pincode text,
    country text DEFAULT 'India'::text,
    aadhaar_number text,
    pan_number text,
    documents jsonb DEFAULT '{}'::jsonb,
    academic_interests text,
    extra_curricular text[] DEFAULT ARRAY[]::text[],
    career_goals text[] DEFAULT ARRAY[]::text[],
    city_preferences text[] DEFAULT ARRAY[]::text[],
    accommodation_preferences text[] DEFAULT ARRAY[]::text[],
    study_style_preferences text[] DEFAULT ARRAY[]::text[],
    budget_ranges text[] DEFAULT ARRAY[]::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    bucket text NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'TODO'::text NOT NULL,
    due_on date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_response_cache ai_response_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_response_cache
    ADD CONSTRAINT ai_response_cache_pkey PRIMARY KEY (id);


--
-- Name: ai_response_cache ai_response_cache_query_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_response_cache
    ADD CONSTRAINT ai_response_cache_query_hash_key UNIQUE (query_hash);


--
-- Name: anonymous_interactions anonymous_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anonymous_interactions
    ADD CONSTRAINT anonymous_interactions_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: career_paths career_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_pkey PRIMARY KEY (id);


--
-- Name: college_courses college_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_courses
    ADD CONSTRAINT college_courses_pkey PRIMARY KEY (id);


--
-- Name: college_placements college_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_placements
    ADD CONSTRAINT college_placements_pkey PRIMARY KEY (id);


--
-- Name: college_rankings college_rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_rankings
    ADD CONSTRAINT college_rankings_pkey PRIMARY KEY (id);


--
-- Name: colleges colleges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_pkey PRIMARY KEY (id);


--
-- Name: comment_reposts comment_reposts_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reposts
    ADD CONSTRAINT comment_reposts_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: comment_reposts comment_reposts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reposts
    ADD CONSTRAINT comment_reposts_pkey PRIMARY KEY (id);


--
-- Name: comment_vibes comment_vibes_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_vibes
    ADD CONSTRAINT comment_vibes_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: comment_vibes comment_vibes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_vibes
    ADD CONSTRAINT comment_vibes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_name_key UNIQUE (name);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: community_members community_members_community_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_community_id_user_id_key UNIQUE (community_id, user_id);


--
-- Name: community_members community_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: entrance_exams entrance_exams_exam_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrance_exams
    ADD CONSTRAINT entrance_exams_exam_name_key UNIQUE (exam_name);


--
-- Name: entrance_exams entrance_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrance_exams
    ADD CONSTRAINT entrance_exams_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: post_views post_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_views
    ADD CONSTRAINT post_views_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: reposts reposts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reposts
    ADD CONSTRAINT reposts_pkey PRIMARY KEY (id);


--
-- Name: reposts reposts_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reposts
    ADD CONSTRAINT reposts_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (id);


--
-- Name: saved_comments saved_comments_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_comments
    ADD CONSTRAINT saved_comments_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: saved_comments saved_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_comments
    ADD CONSTRAINT saved_comments_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: idx_applications_deadline; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_deadline ON public.applications USING btree (deadline);


--
-- Name: idx_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_user_id ON public.applications USING btree (user_id);


--
-- Name: idx_cache_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cache_expires ON public.ai_response_cache USING btree (expires_at);


--
-- Name: idx_cache_query_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cache_query_hash ON public.ai_response_cache USING btree (query_hash);


--
-- Name: idx_career_paths_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_career_paths_title ON public.career_paths USING btree (career_title);


--
-- Name: idx_college_courses_college_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_college_courses_college_id ON public.college_courses USING btree (college_id);


--
-- Name: idx_college_courses_degree_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_college_courses_degree_type ON public.college_courses USING btree (degree_type);


--
-- Name: idx_colleges_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_colleges_name ON public.colleges USING btree (name);


--
-- Name: idx_colleges_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_colleges_state ON public.colleges USING btree (state);


--
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_community_members_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_members_community_id ON public.community_members USING btree (community_id);


--
-- Name: idx_conversations_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_updated_at ON public.conversations USING btree (updated_at DESC);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_documents_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_application_id ON public.documents USING btree (application_id);


--
-- Name: idx_events_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_application_id ON public.events USING btree (application_id);


--
-- Name: idx_faqs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faqs_category ON public.faqs USING btree (category);


--
-- Name: idx_knowledge_base_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_category ON public.knowledge_base USING btree (category);


--
-- Name: idx_knowledge_base_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING gin (tags);


--
-- Name: idx_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_placements_college_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_placements_college_id ON public.college_placements USING btree (college_id);


--
-- Name: idx_placements_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_placements_year ON public.college_placements USING btree (year);


--
-- Name: idx_posts_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_community_id ON public.posts USING btree (community_id);


--
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);


--
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- Name: idx_rankings_college_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rankings_college_id ON public.college_rankings USING btree (college_id);


--
-- Name: idx_reposts_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reposts_post_id ON public.reposts USING btree (post_id);


--
-- Name: idx_requirements_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requirements_application_id ON public.requirements USING btree (application_id);


--
-- Name: idx_student_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_user_id ON public.student_profiles USING btree (user_id);


--
-- Name: idx_tasks_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_application_id ON public.tasks USING btree (application_id);


--
-- Name: applications update_applications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_applications_updated_at();


--
-- Name: messages update_conversation_timestamp_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversation_timestamp_trigger AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();


--
-- Name: student_profiles update_student_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_student_profile_updated_at();


--
-- Name: anonymous_interactions anonymous_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anonymous_interactions
    ADD CONSTRAINT anonymous_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: college_courses college_courses_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_courses
    ADD CONSTRAINT college_courses_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: college_placements college_placements_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_placements
    ADD CONSTRAINT college_placements_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: college_rankings college_rankings_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_rankings
    ADD CONSTRAINT college_rankings_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: comment_reposts comment_reposts_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reposts
    ADD CONSTRAINT comment_reposts_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_reposts comment_reposts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reposts
    ADD CONSTRAINT comment_reposts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comment_reposts comment_reposts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reposts
    ADD CONSTRAINT comment_reposts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: comment_vibes comment_vibes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_vibes
    ADD CONSTRAINT comment_vibes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_vibes comment_vibes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_vibes
    ADD CONSTRAINT comment_vibes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comment_vibes comment_vibes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_vibes
    ADD CONSTRAINT comment_vibes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: communities communities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: community_members community_members_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_members community_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: documents documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: events events_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: post_views post_views_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_views
    ADD CONSTRAINT post_views_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_views post_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_views
    ADD CONSTRAINT post_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reposts reposts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reposts
    ADD CONSTRAINT reposts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: reposts reposts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reposts
    ADD CONSTRAINT reposts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: requirements requirements_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: saved_comments saved_comments_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_comments
    ADD CONSTRAINT saved_comments_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: saved_comments saved_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_comments
    ADD CONSTRAINT saved_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: scholarships scholarships_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: community_members Admins can manage members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage members" ON public.community_members FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.community_members community_members_1
  WHERE ((community_members_1.community_id = community_members_1.community_id) AND (community_members_1.user_id = auth.uid()) AND (community_members_1.is_admin = true)))));


--
-- Name: post_views Anyone can record views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can record views" ON public.post_views FOR INSERT WITH CHECK (true);


--
-- Name: comment_reposts Anyone can view comment reposts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view comment reposts" ON public.comment_reposts FOR SELECT USING (true);


--
-- Name: comment_vibes Anyone can view comment vibes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view comment vibes" ON public.comment_vibes FOR SELECT USING (true);


--
-- Name: comments Anyone can view comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);


--
-- Name: community_members Anyone can view community members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view community members" ON public.community_members FOR SELECT USING (true);


--
-- Name: likes Anyone can view likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);


--
-- Name: posts Anyone can view posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);


--
-- Name: communities Anyone can view public communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public communities" ON public.communities FOR SELECT USING (((NOT is_private) OR (EXISTS ( SELECT 1
   FROM public.community_members
  WHERE ((community_members.community_id = communities.id) AND (community_members.user_id = auth.uid()))))));


--
-- Name: reposts Anyone can view reposts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reposts" ON public.reposts FOR SELECT USING (true);


--
-- Name: comments Authenticated users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: communities Authenticated users can create communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: posts Authenticated users can create posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: likes Authenticated users can like; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can like" ON public.likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reposts Authenticated users can repost; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can repost" ON public.reposts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: comment_reposts Authenticated users can repost comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can repost comments" ON public.comment_reposts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: comment_vibes Authenticated users can vibe comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can vibe comments" ON public.comment_vibes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Authenticated users can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: communities Community creators can delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community creators can delete" ON public.communities FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: communities Community creators can update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community creators can update" ON public.communities FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: faqs Public can view FAQs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view FAQs" ON public.faqs FOR SELECT USING (true);


--
-- Name: ai_response_cache Public can view cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view cache" ON public.ai_response_cache FOR SELECT USING ((expires_at > now()));


--
-- Name: career_paths Public can view career paths; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view career paths" ON public.career_paths FOR SELECT USING (true);


--
-- Name: college_courses Public can view college courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view college courses" ON public.college_courses FOR SELECT USING (true);


--
-- Name: colleges Public can view colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view colleges" ON public.colleges FOR SELECT USING (true);


--
-- Name: entrance_exams Public can view entrance exams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view entrance exams" ON public.entrance_exams FOR SELECT USING (true);


--
-- Name: college_placements Public can view placements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view placements" ON public.college_placements FOR SELECT USING (true);


--
-- Name: knowledge_base Public can view published knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published knowledge base" ON public.knowledge_base FOR SELECT USING ((is_published = true));


--
-- Name: college_rankings Public can view rankings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view rankings" ON public.college_rankings FOR SELECT USING (true);


--
-- Name: scholarships Public can view scholarships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view scholarships" ON public.scholarships FOR SELECT USING (true);


--
-- Name: notifications System can create notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: documents Users can create documents for their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create documents for their applications" ON public.documents FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = documents.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: events Users can create events for their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create events for their applications" ON public.events FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = events.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: anonymous_interactions Users can create interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create interactions" ON public.anonymous_interactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: messages Users can create messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in their conversations" ON public.messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));


--
-- Name: requirements Users can create requirements for their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create requirements for their applications" ON public.requirements FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = requirements.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: tasks Users can create tasks for their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tasks for their applications" ON public.tasks FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = tasks.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: applications Users can create their own applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own applications" ON public.applications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: student_profiles Users can create their own student profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own student profile" ON public.student_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: documents Users can delete documents of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete documents of their applications" ON public.documents FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = documents.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: requirements Users can delete requirements of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete requirements of their applications" ON public.requirements FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = requirements.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: tasks Users can delete tasks of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete tasks of their applications" ON public.tasks FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = tasks.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: applications Users can delete their own applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own applications" ON public.applications FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: posts Users can delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: community_members Users can join communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: community_members Users can leave communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comment_reposts Users can remove their own comment reposts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own comment reposts" ON public.comment_reposts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comment_vibes Users can remove their own comment vibes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own comment vibes" ON public.comment_vibes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: likes Users can remove their own likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own likes" ON public.likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: reposts Users can remove their own reposts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own reposts" ON public.reposts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_comments Users can save comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save comments" ON public.saved_comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_comments Users can unsave comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unsave comments" ON public.saved_comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: requirements Users can update requirements of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update requirements of their applications" ON public.requirements FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = requirements.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: tasks Users can update tasks of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update tasks of their applications" ON public.tasks FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = tasks.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: applications Users can update their own applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own applications" ON public.applications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: posts Users can update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: student_profiles Users can update their own student profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own student profile" ON public.student_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: documents Users can view documents of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents of their applications" ON public.documents FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = documents.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: events Users can view events of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view events of their applications" ON public.events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = events.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: messages Users can view messages from their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from their conversations" ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: requirements Users can view requirements of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view requirements of their applications" ON public.requirements FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = requirements.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: tasks Users can view tasks of their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view tasks of their applications" ON public.tasks FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = tasks.application_id) AND (applications.user_id = auth.uid())))));


--
-- Name: applications Users can view their own applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own applications" ON public.applications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: anonymous_interactions Users can view their own interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own interactions" ON public.anonymous_interactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_comments Users can view their own saved comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own saved comments" ON public.saved_comments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: student_profiles Users can view their own student profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own student profile" ON public.student_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: post_views Users can view their own views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own views" ON public.post_views FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_response_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: anonymous_interactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.anonymous_interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

--
-- Name: career_paths; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;

--
-- Name: college_courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;

--
-- Name: college_placements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.college_placements ENABLE ROW LEVEL SECURITY;

--
-- Name: college_rankings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.college_rankings ENABLE ROW LEVEL SECURITY;

--
-- Name: colleges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

--
-- Name: comment_reposts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comment_reposts ENABLE ROW LEVEL SECURITY;

--
-- Name: comment_vibes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comment_vibes ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: communities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

--
-- Name: community_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: entrance_exams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.entrance_exams ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: faqs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: post_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reposts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

--
-- Name: requirements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: scholarships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

--
-- Name: student_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


