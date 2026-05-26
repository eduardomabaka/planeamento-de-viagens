USE tripplanner;

ALTER TABLE trips
  MODIFY orcamento_total DECIMAL(18,2) NOT NULL DEFAULT 0;

ALTER TABLE trip_expenses
  MODIFY valor DECIMAL(18,2) NOT NULL;

UPDATE users
SET password = '$2y$10$PCp03G2O8PDotqu7BeF1buslCqn5hQWYG/YVp34muJReWIyPsl4VO'
WHERE email = 'admin@tripplanner.com'
  AND password LIKE '%YourHashHere%';

UPDATE users
SET password = '$2y$10$I5S0K0jfIBZSirvbFsCLseDgmUwX2UUf1tQI6egpHfrFGXDPa2vMq'
WHERE email = 'ana@demo.com'
  AND password LIKE '%YourHashHere%';
