-- public.legal_docs definition

-- Drop table

-- DROP TABLE public.legal_docs;

CREATE TABLE public.legal_docs (
	legal_doc_id serial4 NOT NULL,
	"type" public."legal_doc_type_enum" NOT NULL,
	identifier varchar(30) NOT NULL,
	country_code public."country_code_enum" NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_legal_docs PRIMARY KEY (legal_doc_id)
);
CREATE UNIQUE INDEX idx_legal_docs_type_user ON public.legal_docs USING btree (type, user_id);


-- public.legal_docs foreign keys

ALTER TABLE public.legal_docs ADD CONSTRAINT fk_legal_docs_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
ALTER TABLE public.legal_docs ADD CONSTRAINT fk_legaldocs_countries FOREIGN KEY (country_code) REFERENCES public.countries(code);
