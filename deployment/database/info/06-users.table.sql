-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	user_id uuid NOT NULL,
	"name" varchar(30) NOT NULL,
	surname varchar(50) NOT NULL,
	email varchar(100) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_users PRIMARY KEY (user_id)
);
