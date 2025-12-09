export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_response_cache: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          query_hash: string
          response: Json | null
          sources: Json | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          query_hash: string
          response?: Json | null
          sources?: Json | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          query_hash?: string
          response?: Json | null
          sources?: Json | null
        }
        Relationships: []
      }
      anonymous_interactions: {
        Row: {
          anonymous_name: string
          created_at: string
          id: string
          interaction_type: string
          target_id: string
          user_id: string
        }
        Insert: {
          anonymous_name: string
          created_at?: string
          id?: string
          interaction_type: string
          target_id: string
          user_id: string
        }
        Update: {
          anonymous_name?: string
          created_at?: string
          id?: string
          interaction_type?: string
          target_id?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          app_id: string | null
          country: string
          course: string
          created_at: string
          current_status: string
          deadline: string
          decision: string | null
          decision_date: string | null
          fee_amount: number
          fee_paid: boolean
          id: string
          image_url: string | null
          level: string
          portal: string
          scholarship_note: string | null
          term: string
          university: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id?: string | null
          country: string
          course: string
          created_at?: string
          current_status?: string
          deadline: string
          decision?: string | null
          decision_date?: string | null
          fee_amount: number
          fee_paid?: boolean
          id?: string
          image_url?: string | null
          level: string
          portal: string
          scholarship_note?: string | null
          term: string
          university: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string | null
          country?: string
          course?: string
          created_at?: string
          current_status?: string
          deadline?: string
          decision?: string | null
          decision_date?: string | null
          fee_amount?: number
          fee_paid?: boolean
          id?: string
          image_url?: string | null
          level?: string
          portal?: string
          scholarship_note?: string | null
          term?: string
          university?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      awards: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      career_paths: {
        Row: {
          avg_salary_range: string | null
          career_title: string
          description: string | null
          growth_prospects: string | null
          id: string
          last_updated: string | null
          market_demand: string | null
          recommended_courses: Json | null
          related_fields: string[] | null
          required_education: string[] | null
          skills_required: string[] | null
          top_companies: string[] | null
        }
        Insert: {
          avg_salary_range?: string | null
          career_title: string
          description?: string | null
          growth_prospects?: string | null
          id?: string
          last_updated?: string | null
          market_demand?: string | null
          recommended_courses?: Json | null
          related_fields?: string[] | null
          required_education?: string[] | null
          skills_required?: string[] | null
          top_companies?: string[] | null
        }
        Update: {
          avg_salary_range?: string | null
          career_title?: string
          description?: string | null
          growth_prospects?: string | null
          id?: string
          last_updated?: string | null
          market_demand?: string | null
          recommended_courses?: Json | null
          related_fields?: string[] | null
          required_education?: string[] | null
          skills_required?: string[] | null
          top_companies?: string[] | null
        }
        Relationships: []
      }
      college_courses: {
        Row: {
          college_id: string | null
          course_highlights: string[] | null
          course_name: string
          created_at: string | null
          degree_type: string | null
          department: string | null
          duration: string | null
          eligibility: string | null
          entrance_exams: string[] | null
          fees_per_year: number | null
          id: string
          last_updated: string | null
          mode_of_study: string | null
          seats_available: number | null
          specialization: string | null
          total_fees: number | null
        }
        Insert: {
          college_id?: string | null
          course_highlights?: string[] | null
          course_name: string
          created_at?: string | null
          degree_type?: string | null
          department?: string | null
          duration?: string | null
          eligibility?: string | null
          entrance_exams?: string[] | null
          fees_per_year?: number | null
          id?: string
          last_updated?: string | null
          mode_of_study?: string | null
          seats_available?: number | null
          specialization?: string | null
          total_fees?: number | null
        }
        Update: {
          college_id?: string | null
          course_highlights?: string[] | null
          course_name?: string
          created_at?: string | null
          degree_type?: string | null
          department?: string | null
          duration?: string | null
          eligibility?: string | null
          entrance_exams?: string[] | null
          fees_per_year?: number | null
          id?: string
          last_updated?: string | null
          mode_of_study?: string | null
          seats_available?: number | null
          specialization?: string | null
          total_fees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "college_courses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_placements: {
        Row: {
          avg_package: number | null
          college_id: string | null
          companies_visited: number | null
          highest_package: number | null
          id: string
          last_updated: string | null
          median_package: number | null
          placement_percentage: number | null
          top_recruiters: string[] | null
          total_offers: number | null
          year: number | null
        }
        Insert: {
          avg_package?: number | null
          college_id?: string | null
          companies_visited?: number | null
          highest_package?: number | null
          id?: string
          last_updated?: string | null
          median_package?: number | null
          placement_percentage?: number | null
          top_recruiters?: string[] | null
          total_offers?: number | null
          year?: number | null
        }
        Update: {
          avg_package?: number | null
          college_id?: string | null
          companies_visited?: number | null
          highest_package?: number | null
          id?: string
          last_updated?: string | null
          median_package?: number | null
          placement_percentage?: number | null
          top_recruiters?: string[] | null
          total_offers?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "college_placements_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_rankings: {
        Row: {
          category: string | null
          college_id: string | null
          id: string
          last_updated: string | null
          rank: number | null
          ranking_body: string | null
          score: number | null
          year: number | null
        }
        Insert: {
          category?: string | null
          college_id?: string | null
          id?: string
          last_updated?: string | null
          rank?: number | null
          ranking_body?: string | null
          score?: number | null
          year?: number | null
        }
        Update: {
          category?: string | null
          college_id?: string | null
          id?: string
          last_updated?: string | null
          rank?: number | null
          ranking_body?: string | null
          score?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "college_rankings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          accreditation: Json | null
          campus_area: string | null
          contact: Json | null
          country: string | null
          created_at: string | null
          faculty_count: number | null
          founded_year: number | null
          highlights: string[] | null
          id: string
          image_url: string | null
          last_updated: string | null
          location: string | null
          naac_grade: string | null
          name: string
          nirf_category: string | null
          nirf_rank: number | null
          qs_rank: number | null
          state: string | null
          student_count: number | null
          university_type: string | null
          website: string | null
        }
        Insert: {
          accreditation?: Json | null
          campus_area?: string | null
          contact?: Json | null
          country?: string | null
          created_at?: string | null
          faculty_count?: number | null
          founded_year?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          location?: string | null
          naac_grade?: string | null
          name: string
          nirf_category?: string | null
          nirf_rank?: number | null
          qs_rank?: number | null
          state?: string | null
          student_count?: number | null
          university_type?: string | null
          website?: string | null
        }
        Update: {
          accreditation?: Json | null
          campus_area?: string | null
          contact?: Json | null
          country?: string | null
          created_at?: string | null
          faculty_count?: number | null
          founded_year?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          location?: string | null
          naac_grade?: string | null
          name?: string
          nirf_category?: string | null
          nirf_rank?: number | null
          qs_rank?: number | null
          state?: string | null
          student_count?: number | null
          university_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      comment_awards: {
        Row: {
          award_id: string
          comment_id: string
          created_at: string | null
          given_by: string
          id: string
        }
        Insert: {
          award_id: string
          comment_id: string
          created_at?: string | null
          given_by: string
          id?: string
        }
        Update: {
          award_id?: string
          comment_id?: string
          created_at?: string | null
          given_by?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_awards_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: number
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          anonymous_name: string | null
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_name?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_name?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          banner: string | null
          cover_photo: string | null
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_private: boolean | null
          name: string
          profile_photo: string | null
          rules: string[] | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          banner?: string | null
          cover_photo?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          profile_photo?: string | null
          rules?: string[] | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          banner?: string | null
          cover_photo?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          profile_photo?: string | null
          rules?: string[] | null
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          is_admin: boolean | null
          is_moderator: boolean | null
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          application_id: string
          id: string
          kind: string
          name: string
          uploaded_at: string
          url: string
        }
        Insert: {
          application_id: string
          id?: string
          kind: string
          name: string
          uploaded_at?: string
          url: string
        }
        Update: {
          application_id?: string
          id?: string
          kind?: string
          name?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      entrance_exams: {
        Row: {
          applicable_for: string[] | null
          conducting_body: string | null
          exam_dates: Json | null
          exam_name: string
          exam_pattern: Json | null
          exam_type: string | null
          full_name: string | null
          id: string
          last_updated: string | null
          official_website: string | null
          registration_dates: Json | null
          syllabus_url: string | null
        }
        Insert: {
          applicable_for?: string[] | null
          conducting_body?: string | null
          exam_dates?: Json | null
          exam_name: string
          exam_pattern?: Json | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          registration_dates?: Json | null
          syllabus_url?: string | null
        }
        Update: {
          applicable_for?: string[] | null
          conducting_body?: string | null
          exam_dates?: Json | null
          exam_name?: string
          exam_pattern?: Json | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          last_updated?: string | null
          official_website?: string | null
          registration_dates?: Json | null
          syllabus_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          application_id: string
          detail: string
          id: string
          timestamp: string
          type: string
        }
        Insert: {
          application_id: string
          detail: string
          id?: string
          timestamp?: string
          type: string
        }
        Update: {
          application_id?: string
          detail?: string
          id?: string
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          helpful_count: number | null
          id: string
          last_updated: string | null
          question: string
          related_to: string[] | null
        }
        Insert: {
          answer: string
          category?: string | null
          helpful_count?: number | null
          id?: string
          last_updated?: string | null
          question: string
          related_to?: string[] | null
        }
        Update: {
          answer?: string
          category?: string | null
          helpful_count?: number | null
          id?: string
          last_updated?: string | null
          question?: string
          related_to?: string[] | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          last_updated: string | null
          metadata: Json | null
          related_colleges: string[] | null
          related_courses: string[] | null
          tags: string[] | null
          title: string
          views_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          related_colleges?: string[] | null
          related_courses?: string[] | null
          tags?: string[] | null
          title: string
          views_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          related_colleges?: string[] | null
          related_courses?: string[] | null
          tags?: string[] | null
          title?: string
          views_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          career_data: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          career_data?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          career_data?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          options: Json
          post_id: string
          question: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_awards: {
        Row: {
          award_id: string
          created_at: string | null
          given_by: string
          id: string
          post_id: string
        }
        Insert: {
          award_id: string
          created_at?: string | null
          given_by: string
          id?: string
          post_id: string
        }
        Update: {
          award_id?: string
          created_at?: string | null
          given_by?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_awards_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          anonymous_name: string | null
          college: string | null
          community_id: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_archived: boolean | null
          is_live: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          link_preview: Json | null
          media: string | null
          media_items: Json | null
          media_type: string | null
          media_url: string | null
          pinned_at: string | null
          pinned_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_name?: string | null
          college?: string | null
          community_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_archived?: boolean | null
          is_live?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          link_preview?: Json | null
          media?: string | null
          media_items?: Json | null
          media_type?: string | null
          media_url?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_name?: string | null
          college?: string | null
          community_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_archived?: boolean | null
          is_live?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          link_preview?: Json | null
          media?: string | null
          media_items?: Json | null
          media_type?: string | null
          media_url?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comment_karma: number | null
          created_at: string
          display_name: string | null
          id: string
          post_karma: number | null
          total_karma: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comment_karma?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          post_karma?: number | null
          total_karma?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comment_karma?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          post_karma?: number | null
          total_karma?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      reposts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          application_id: string
          created_at: string
          due_on: string | null
          id: string
          is_required: boolean
          label: string
          notes: string | null
          status: string
          type: string
        }
        Insert: {
          application_id: string
          created_at?: string
          due_on?: string | null
          id?: string
          is_required?: boolean
          label: string
          notes?: string | null
          status?: string
          type: string
        }
        Update: {
          application_id?: string
          created_at?: string
          due_on?: string | null
          id?: string
          is_required?: boolean
          label?: string
          notes?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_comments: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_comments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount_range: string | null
          application_deadline: string | null
          college_id: string | null
          eligibility_criteria: string | null
          id: string
          last_updated: string | null
          scholarship_name: string
          scholarship_type: string | null
          website_url: string | null
        }
        Insert: {
          amount_range?: string | null
          application_deadline?: string | null
          college_id?: string | null
          eligibility_criteria?: string | null
          id?: string
          last_updated?: string | null
          scholarship_name: string
          scholarship_type?: string | null
          website_url?: string | null
        }
        Update: {
          amount_range?: string | null
          application_deadline?: string | null
          college_id?: string | null
          eligibility_criteria?: string | null
          id?: string
          last_updated?: string | null
          scholarship_name?: string
          scholarship_type?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      shortlisted_colleges: {
        Row: {
          college_data: Json
          college_id: string
          college_name: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          college_data: Json
          college_id: string
          college_name: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          college_data?: Json
          college_id?: string
          college_name?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      student_profile_audit: {
        Row: {
          access_type: string
          accessed_at: string | null
          accessed_by: string
          id: string
          ip_address: string | null
          profile_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          accessed_by: string
          id?: string
          ip_address?: string | null
          profile_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string
          id?: string
          ip_address?: string | null
          profile_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          aadhaar_number: string | null
          academic_interests: string | null
          accommodation_preferences: string[] | null
          alternate_phone: string | null
          annual_family_income: number | null
          budget_ranges: string[] | null
          career_goals: string[] | null
          category: string | null
          city: string | null
          city_preferences: string[] | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          documents: Json | null
          email: string | null
          entrance_exam_other_specify: string | null
          entrance_exams: Json | null
          extra_curricular: string[] | null
          father_email: string | null
          father_name: string | null
          father_occupation: string | null
          father_phone: string | null
          father_phone_country_code: string | null
          full_name: string | null
          gender: string | null
          guardian_name: string | null
          guardian_relation: string | null
          id: string
          is_pwd: boolean | null
          mother_email: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_phone: string | null
          mother_phone_country_code: string | null
          nationality: string | null
          pan_number: string | null
          permanent_address: string | null
          phone: string | null
          phone_country_code: string | null
          pincode: string | null
          profile_picture_url: string | null
          pwd_type: string | null
          state: string | null
          study_style_preferences: string[] | null
          tenth_board: string | null
          tenth_percentage: number | null
          tenth_school_name: string | null
          tenth_year: number | null
          twelfth_board: string | null
          twelfth_percentage: number | null
          twelfth_school_name: string | null
          twelfth_stream: string | null
          twelfth_subjects: string[] | null
          twelfth_year: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aadhaar_number?: string | null
          academic_interests?: string | null
          accommodation_preferences?: string[] | null
          alternate_phone?: string | null
          annual_family_income?: number | null
          budget_ranges?: string[] | null
          career_goals?: string[] | null
          category?: string | null
          city?: string | null
          city_preferences?: string[] | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          entrance_exam_other_specify?: string | null
          entrance_exams?: Json | null
          extra_curricular?: string[] | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          father_phone_country_code?: string | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_relation?: string | null
          id?: string
          is_pwd?: boolean | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          mother_phone_country_code?: string | null
          nationality?: string | null
          pan_number?: string | null
          permanent_address?: string | null
          phone?: string | null
          phone_country_code?: string | null
          pincode?: string | null
          profile_picture_url?: string | null
          pwd_type?: string | null
          state?: string | null
          study_style_preferences?: string[] | null
          tenth_board?: string | null
          tenth_percentage?: number | null
          tenth_school_name?: string | null
          tenth_year?: number | null
          twelfth_board?: string | null
          twelfth_percentage?: number | null
          twelfth_school_name?: string | null
          twelfth_stream?: string | null
          twelfth_subjects?: string[] | null
          twelfth_year?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aadhaar_number?: string | null
          academic_interests?: string | null
          accommodation_preferences?: string[] | null
          alternate_phone?: string | null
          annual_family_income?: number | null
          budget_ranges?: string[] | null
          career_goals?: string[] | null
          category?: string | null
          city?: string | null
          city_preferences?: string[] | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          entrance_exam_other_specify?: string | null
          entrance_exams?: Json | null
          extra_curricular?: string[] | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          father_phone_country_code?: string | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_relation?: string | null
          id?: string
          is_pwd?: boolean | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          mother_phone_country_code?: string | null
          nationality?: string | null
          pan_number?: string | null
          permanent_address?: string | null
          phone?: string | null
          phone_country_code?: string | null
          pincode?: string | null
          profile_picture_url?: string | null
          pwd_type?: string | null
          state?: string | null
          study_style_preferences?: string[] | null
          tenth_board?: string | null
          tenth_percentage?: number | null
          tenth_school_name?: string | null
          tenth_year?: number | null
          twelfth_board?: string | null
          twelfth_percentage?: number | null
          twelfth_school_name?: string | null
          twelfth_stream?: string | null
          twelfth_subjects?: string[] | null
          twelfth_year?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          application_id: string
          bucket: string
          created_at: string
          due_on: string | null
          id: string
          status: string
          title: string
        }
        Insert: {
          application_id: string
          bucket: string
          created_at?: string
          due_on?: string | null
          id?: string
          status?: string
          title: string
        }
        Update: {
          application_id?: string
          bucket?: string
          created_at?: string
          due_on?: string | null
          id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_by: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mutes: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          muted_by: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          muted_by: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          muted_by?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_comment_karma: {
        Args: { user_id_param: string }
        Returns: number
      }
      calculate_user_post_karma: {
        Args: { user_id_param: string }
        Returns: number
      }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      cleanup_old_post_views: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_actor_id: string
          p_comment_id?: string
          p_post_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_comment_vibe_count: {
        Args: { comment_id_param: string }
        Returns: number
      }
      get_comment_vibes_count: {
        Args: { post_id_param: string }
        Returns: {
          comment_id: string
          count: number
        }[]
      }
      get_comment_vote_score: {
        Args: { comment_id_param: string }
        Returns: number
      }
      get_post_vote_score: { Args: { post_id_param: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_community_member: {
        Args: { _community_id: string; _user_id: string }
        Returns: boolean
      }
      is_moderator_or_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_user_muted: { Args: { _user_id: string }; Returns: boolean }
      update_user_karma: { Args: { user_id_param: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
