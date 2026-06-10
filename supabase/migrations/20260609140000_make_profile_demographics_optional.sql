-- Age and gender are now optional on the intake form. Drop the NOT NULL
-- constraints so existing rows are unaffected and new rows can omit them.
-- PostgreSQL passes NULL through CHECK constraints (NULL BETWEEN 13 AND 120
-- evaluates to NULL, not FALSE), so the age range check stays valid.

alter table public.profiles
  alter column age drop not null,
  alter column gender drop not null;
