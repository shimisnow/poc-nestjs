-- public.addresses definition

-- Drop table

-- DROP TABLE public.addresses;

CREATE TABLE public.addresses (
	address_id serial4 NOT NULL,
	postalcode varchar(20) NOT NULL,
	"type" public."address_type_enum" DEFAULT 'main'::address_type_enum NULL,
	country_code public."country_code_enum" NOT NULL,
	user_id uuid NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT pk_addresses PRIMARY KEY (address_id)
);
CREATE UNIQUE INDEX idx_addresses_type_user ON public.addresses USING btree (type, user_id);


-- public.addresses foreign keys

ALTER TABLE public.addresses ADD CONSTRAINT fk_addresses_countries FOREIGN KEY (country_code) REFERENCES public.countries(code);
ALTER TABLE public.addresses ADD CONSTRAINT fk_addresses_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
