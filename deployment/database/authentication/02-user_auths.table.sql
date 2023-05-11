-- public.user_auths definition

-- Drop table

-- DROP TABLE public.user_auths;

CREATE TABLE public.user_auths (
	user_id int4 NOT NULL,
	username varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	created_at timestamp NULL DEFAULT now(),
	updated_at timestamp NULL DEFAULT now(),
	status public."user_auth_status_enum" NULL DEFAULT 'inactive'::user_auth_status_enum,
	CONSTRAINT pk_user_auths PRIMARY KEY (user_id)
);
CREATE UNIQUE INDEX idx_user_auths_username ON public.user_auths USING btree (username);