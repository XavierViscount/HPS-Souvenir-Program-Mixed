# Free Mini App Hosting

The Mini App is a static website. GitHub Pages can host it for free and provides the HTTPS address Telegram requires. This hosts only the website; the Python bot must still be running on your computer or another bot host.

## 1. Rotate and protect the bot token

The old bot source contained a token directly in the file. Treat it as exposed: regenerate it with BotFather, then keep the new token only in your local environment. Never upload `bot.py` or the token to the public website repository.

## 2. Create an app-only repository

On GitHub, create a new **public** repository, for example `hps-flower-mini-app`. Upload the **contents** of this `mini_app/` folder to the repository root:

- `index.html`
- `styles.css`
- `app.js`
- the `assets/flowers/` folder

Do not upload the parent project, `bot.py`, or `.env` files. Keeping this as a separate repository prevents accidentally publishing bot files.

## 3. Enable GitHub Pages

In the new repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` branch and `/(root)`, then save. Wait for GitHub to finish publishing. The address will look like:

```text
https://YOUR-GITHUB-NAME.github.io/hps-flower-mini-app/
```

Open that address in a normal browser first and confirm the flower thumbnails appear.

## 4. Point the bot at the Mini App

In PowerShell, set both environment variables in the same terminal where you will run the bot. Use the regenerated token locally; do not paste it into source code or chat.

```powershell
$env:TELEGRAM_BOT_TOKEN = "YOUR_REGENERATED_BOT_TOKEN"
$env:TELEGRAM_WEB_APP_URL = "https://YOUR-GITHUB-NAME.github.io/hps-flower-mini-app/"
py -3 bot.py
```

Open a private chat with your bot and send `/start`. Tap **ပန်းစည်း Mini App**, submit a test order, and confirm that the bot sends the souvenir card. Keep this Python process running to receive Mini App orders.

## Local Preview

From the project root, run:

```powershell
py -3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/mini_app/`. Local HTTP is only for preview; Telegram needs the deployed public HTTPS address.

Order choices include a mixed bouquet with adjustable quantities, one flower type with an adjustable quantity, and the existing set of all 10 flower types (one each). Each order can use a balanced, compact, or fan-shaped arrangement. The selected preset changes the flower spread in the generated card; the default for older Mini App payloads remains balanced.
