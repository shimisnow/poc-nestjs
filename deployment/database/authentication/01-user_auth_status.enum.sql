-- DROP TYPE public."user_auth_status_enum";

CREATE TYPE public."user_auth_status_enum" AS ENUM (
	'active',
	'inactive');
