-- public.balances definition

-- Drop table

-- DROP TABLE public.balances;

CREATE TABLE public.balances (
	account_id int4 NULL,
	balance float4 NOT NULL DEFAULT '0'::real,
	last_transaction_id int4 NOT NULL DEFAULT 0,
	update_at timestamp NULL DEFAULT now(),
	balance_id serial4 NOT NULL,
	CONSTRAINT "REL_8aaa66deb29fafadaface63b91" UNIQUE (last_transaction_id),
	CONSTRAINT "UQ_3dea73cdec0185cf943b0c02216" UNIQUE (account_id),
	CONSTRAINT pk_balances PRIMARY KEY (balance_id)
);
CREATE UNIQUE INDEX idx_balances ON public.balances USING btree (account_id);


-- public.balances foreign keys

ALTER TABLE public.balances ADD CONSTRAINT fk_balances_accounts FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);
ALTER TABLE public.balances ADD CONSTRAINT fk_balances_transactions FOREIGN KEY (last_transaction_id) REFERENCES public.transactions(transaction_id);