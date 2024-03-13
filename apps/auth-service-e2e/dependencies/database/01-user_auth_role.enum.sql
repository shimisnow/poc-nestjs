-- DROP TYPE public."user_auth_role_enum";

CREATE TYPE public."user_auth_role_enum" AS ENUM (
	'admin',
	'user');
