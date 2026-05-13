CREATE TABLE IF NOT EXISTS stores (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS historical_sales (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  sale_date  DATE    NOT NULL,
  sale_hour  INTEGER NOT NULL CHECK (sale_hour >= 0 AND sale_hour <= 23),
  quantity   INTEGER NOT NULL CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS forecasts (
  id                 SERIAL PRIMARY KEY,
  store_id           INTEGER NOT NULL REFERENCES stores(id),
  product_id         INTEGER NOT NULL REFERENCES products(id),
  forecast_date      DATE    NOT NULL,
  sale_hour          INTEGER NOT NULL CHECK (sale_hour >= 0 AND sale_hour <= 23),
  predicted_quantity NUMERIC(10, 2) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT forecasts_unique UNIQUE (store_id, product_id, forecast_date, sale_hour)
);
