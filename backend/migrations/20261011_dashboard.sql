-- Migração aditiva: não apaga dados. Datas das estatísticas em UTC.
CREATE TABLE IF NOT EXISTS site_view_daily (
  view_date DATE NOT NULL,
  views BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (view_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS analytics_metadata (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  started_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO analytics_metadata (id, started_at) VALUES (1, UTC_TIMESTAMP());
