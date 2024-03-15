-- DROP TYPE public."social_media_type_enum";

CREATE TYPE public."social_media_type_enum" AS ENUM (
	'facebook',
	'instagram',
	'linkedin',
	'tiktok',
	'website',
	'youtube');
  