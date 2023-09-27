-- public.accounts definition

-- Drop table

-- DROP TABLE public.accounts;

CREATE TABLE public.accounts (
	account_id serial4 NOT NULL,
	user_id int4 NOT NULL,
	CONSTRAINT pk_accounts PRIMARY KEY (account_id)
);
CREATE UNIQUE INDEX "IDX_ae02119e33dbedf30152970c24" ON public.accounts USING btree (account_id, user_id);