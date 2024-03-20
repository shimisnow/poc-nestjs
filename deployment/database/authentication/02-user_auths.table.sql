-- public.user_auths definition

-- Drop table

-- DROP TABLE public.user_auths;

CREATE TABLE public.user_auths (
	user_id uuid DEFAULT uuid_generate_v4() NOT NULL,
	username varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	status public."user_auth_status_enum" DEFAULT 'active'::user_auth_status_enum NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	"role" public."user_auth_role_enum" DEFAULT 'user'::user_auth_role_enum NULL,
	CONSTRAINT pk_user_auths PRIMARY KEY (user_id)
);
CREATE UNIQUE INDEX idx_user_auths_username ON public.user_auths USING btree (username);
