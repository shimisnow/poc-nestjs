-- DROP TYPE public."phone_type_enum";

CREATE TYPE public."phone_type_enum" AS ENUM (
	'main',
	'home',
	'work');
  