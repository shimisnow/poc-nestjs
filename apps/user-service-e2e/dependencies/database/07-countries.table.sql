-- public.countries definition

-- Drop table

-- DROP TABLE public.countries;

CREATE TABLE public.countries (
	code public."country_code_enum" NOT NULL,
	calling_code int4 NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_countries PRIMARY KEY (code)
);
