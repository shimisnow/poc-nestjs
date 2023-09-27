-- DROP TYPE public."transaction_type_enum";

CREATE TYPE public."transaction_type_enum" AS ENUM (
	'debt',
	'credit');