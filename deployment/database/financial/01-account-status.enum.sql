-- DROP TYPE public."account_status_enum";

CREATE TYPE public."account_status_enum" AS ENUM (
	'active',
	'inactive');