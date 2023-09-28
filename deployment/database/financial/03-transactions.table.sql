-- public.transactions definition

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions (
	transaction_id serial4 NOT NULL,
	account_id int4 NOT NULL,
	"type" public."transaction_type_enum" NOT NULL,
	amount float4 NOT NULL,
	created_at timestamp NULL DEFAULT now(),
	CONSTRAINT pk_transactions PRIMARY KEY (transaction_id)
);


-- public.transactions foreign keys

ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_accounts FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);