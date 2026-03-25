CREATE TABLE IF NOT EXISTS public.otp (
  id         SERIAL PRIMARY KEY,
  tel        VARCHAR(20)  NOT NULL,
  code       VARCHAR(4)   NOT NULL,
  expires_at TIMESTAMP    NOT NULL,
  created_at TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_tel ON public.otp(tel);