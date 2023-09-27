-- public.balances definition

-- Drop table

-- DROP TABLE public.balances;

CREATE TABLE public.balances (
	account_id int4 NOT NULL,
	balance float4 NOT NULL DEFAULT '0'::real,
	last_transaction_id int4 NOT NULL DEFAULT 0,
	update_at timestamp NULL DEFAULT now(),
	CONSTRAINT pk_balances PRIMARY KEY (account_id)
);