CREATE DATABASE jobs_api;

  CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(50) not null,
email VARCHAR(255) not null UNIQUE,
password VARCHAR(255) not null,
CHECK (char_length(name)>=3 and char_length(name)<=50),
Check (char_length(password)>=6));
\c jobs_api

  CREATE TABLE jobs(
	job_id SERIAL PRIMARY KEY,
	company VARCHAR(50) not null,
  position VARCHAR(100) not null,
  status VARCHAR(255) not null CHECK (status in ('entretion','refusé', 'en attent')) default 'en attente',  
  user_id INT REFERENCES users(user_id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now());

CREATE FUNCTION update_updated_at() returns TRIGGER as $$
BEGIN
  NEW.updated_at=NOW();
  return NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updated_jobs
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();