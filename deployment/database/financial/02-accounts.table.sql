-- public.accounts definition

-- Drop table

-- DROP TABLE public.accounts;

CREATE TABLE public.accounts (
	account_id serial4 NOT NULL,
	user_id uuid NOT NULL,
	CONSTRAINT pk_accounts PRIMARY KEY (account_id)
);
CREATE UNIQUE INDEX idx_accounts ON public.accounts USING btree (account_id, user_id);

-- public.accounts seqs

ALTER SEQUENCE accounts_account_id_seq RESTART WITH 1000;