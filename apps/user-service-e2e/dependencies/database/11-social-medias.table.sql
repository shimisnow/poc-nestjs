-- public.social_medias definition

-- Drop table

-- DROP TABLE public.social_medias;

CREATE TABLE public.social_medias (
	social_media_id serial4 NOT NULL,
	"type" public."social_media_type_enum" NOT NULL,
	identifier varchar(100) NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_social_medias PRIMARY KEY (social_media_id)
);


-- public.social_medias foreign keys

ALTER TABLE public.social_medias ADD CONSTRAINT fk_social_medias_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
