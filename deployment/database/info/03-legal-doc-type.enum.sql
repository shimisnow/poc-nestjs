-- DROP TYPE public."legal_doc_type_enum";

CREATE TYPE public."legal_doc_type_enum" AS ENUM (
	'BRA-RG',
	'BRA-CNH',
	'USA-SSN');
  