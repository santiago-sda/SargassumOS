insert into beaches (name, lat, lng, country) values
  ('Vero Beach',           27.6386, -80.3973, 'United States'),
  ('Fort Pierce Beach',    27.4467, -80.3256, 'United States'),
  ('Palm Beach',           26.7056, -80.0364, 'United States'),
  ('Boca Raton Beach',     26.3683, -80.0756, 'United States'),
  ('Fort Lauderdale Beach',26.1224, -80.1020, 'United States'),
  ('Hollywood Beach',      26.0112, -80.1198, 'United States'),
  ('Miami Beach',          25.7907, -80.1300, 'United States'),
  ('Key Biscayne',         25.6897, -80.1577, 'United States')
on conflict do nothing;
