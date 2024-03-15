-- public.phones definition

-- Drop table

-- DROP TABLE public.phones;

CREATE TABLE public.phones (
	phone_id serial4 NOT NULL,
	"type" public."phone_type_enum" DEFAULT 'main'::phone_type_enum NULL,
	"number" int4 NOT NULL,
	country_code public."country_code_enum" NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_phones PRIMARY KEY (phone_id)
);
CREATE UNIQUE INDEX idx_phones_type_user ON public.phones USING btree (type, user_id);


-- public.phones foreign keys

ALTER TABLE public.phones ADD CONSTRAINT fk_phones_countries FOREIGN KEY (country_code) REFERENCES public.countries(code);
ALTER TABLE public.phones ADD CONSTRAINT fk_phones_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
