# Top-tier Frontend

React + Vite application for the Top-tier platform.

## Parallax Intelligence

The Top-tier app includes a Parallax Intelligence page in authenticated navigation. It uses the existing Top-tier login session and backend API; users do not need a separate Parallax account.

Set `VITE_API_URL` to the existing Top-tier backend URL. The Twelve Data API key belongs only in the backend's Render environment as `TWELVE_DATA_API_KEY` and must never be exposed as a Vite variable.

The Parallax page displays analysis candidates and the user's recent analysis history. Free users currently have M15 and H1 analysis; premium timeframes are feature-gated by the backend. Subscription billing is not yet connected. Live broker execution is disabled.
