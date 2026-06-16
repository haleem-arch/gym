# Custom WhatsApp Gateway for Life Gym

A lightweight, self-hosted Node.js microservice using `@whiskeysockets/baileys` to connect any WhatsApp account via a QR code and send text notifications via a secure REST API.

## Installation

1. Navigate to this folder:
   ```bash
   cd whatsapp-gateway
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your preferred configurations:
   ```env
   PORT=3001
   WHATSAPP_GATEWAY_TOKEN=your_secure_auth_token_here
   WEBHOOK_URL=http://localhost:5173/api/user-management?action=whatsapp-incoming
   WEBHOOK_TOKEN=your_secure_auth_token_here
   ```

## Running the Server

Start the server locally:
```bash
npm start
```

## API Endpoints

- **`GET /status`**: Check the current WhatsApp Web session connection state. If disconnected, it returns a base64 encoded QR code PNG under the `qr` property.
- **`POST /send-text`**: Send a message to a number.
  - Header: `Authorization: Bearer <your_secure_auth_token_here>`
  - Body: `{ "to": "201234567890", "text": "Hello, world!" }`
- **`POST /logout`**: Logs out of the current WhatsApp Web session and resets the gateway to display a new QR code.
  - Header: `Authorization: Bearer <your_secure_auth_token_here>`
