Slack Connect - Cobalt AI Assignment  

Slack Connect is a full-stack application that allows users to:

🔒 Securely connect to their Slack workspace using OAuth 2.0

✉️ Send immediate messages to channels

⏰ Schedule messages to be sent later

🗑️ View and manage (cancel) scheduled messages

📂 Project Structure
arduino

slack-connect/<br>
├── backend/          // Node.js + Express + TypeScript<br>
├── frontend/         // React + TypeScript<br>
└── README.md<br>
📦 Technology Stack
Layer	Tech Used
Frontend	React, TypeScript, Axios, React Router
Backend	Node.js, Express.js, TypeScript
OAuth	Slack OAuth 2.0
Scheduler	node-cron
Deployment	(optional) Vercel, Render , Netlify

🛠️ Setup Instructions
1. Clone the Repository
bash<br>

git clone https://github.com/yourusername/slack-connect.git
cd slack-connect<br>
2. Backend Setup (/backend)<br>
🔧 Install Dependencies
bash
<br>
cd backend<br>
npm install<br>
📁 Create .env file

env<br>

SLACK_CLIENT_ID=your_slack_client_id<br>
SLACK_CLIENT_SECRET=your_slack_client_secret<br>
SLACK_REDIRECT_URI= http://localhost:5000/auth/callback<br>
PORT=5000<br>
▶️ Run Backend Server<br>
bash
npm run dev<br>
3. Frontend Setup (/frontend)
<br>
🔧 Install Dependencies<br>

frontend<br>
npm install<br>
📁 Create .env file<br>
env
<br>
REACT_APP_API_BASE=http://localhost:5000 <br>
▶️ Run Frontend Server <br>

npm start<br>
🔐 Slack App Configuration<br>
Go to Slack API Dashboard<br>

Create a new app from scratch<br>

Enable OAuth & Permissions<br>

Add redirect URI: http://localhost:5000/auth/callback<br>

Add scopes:
<br>
chat:write
<br>
channels:read
<br>
Copy Client ID and Client Secret into .env
<br>
🧱 Architectural Overview<br>
➤ OAuth Flow<br>
Users click "Connect to Slack"<br>

Redirected to Slack OAuth screen<br>

Backend handles code and exchanges it for access_token and refresh_token
<br>
Tokens stored securely in database (along with team/user identifiers)<br>

➤ Token Management
<br>
access_token is used to send messages
<br>
When expired, backend uses refresh_token to get a new token<br>

Automatically refreshed before use via middleware or scheduled job
<br>
➤ Message Handling<br>
Messages can be sent immediately or scheduled<br>
<br>
Scheduled messages stored in DB with time<br>
node-cron runs every minute to check and send due messages<br>

➤ Cancel Scheduled Message<br>
Users can see a list of scheduled messages<br>

Option to cancel (which deletes from DB)<br>

📸 UI Features<br>
✅ Connect your Slack Workspace<br>

📋 List all channels (via API)<br>

💬 Compose a message<br>

🕒 Select scheduled time (via datetime input)

📅 View scheduled messages

❌ Cancel any future message

🌐 Deployment (Optional)
If you deploy:

Frontend: Vercel or Netlify

Backend: Render, Heroku, Railway

Update .env values with your deployed backend URL and Slack redirect URL

💡 Challenges & Learnings<br>
🔄 Refresh Token Logic<br>
Slack does not provide long-lived refresh tokens. Learned to:<br>

Use oauth.v2.access to reauthenticate when tokens expire<br>

Store token expiry time in DB<br>

Auto-refresh just before expiry<br>

⏰ Reliable Scheduling<br>
Message scheduling with setTimeout isn't reliable for long durations.<br>

Switched to node-cron polling every minute

Made sure to handle messages missed due to downtime

🔐 Secure Token Storage
Used DB with encryption (optional) or .env secret key

Scoped tokens to team/user

🔄 Channel Selection
Slack API returns only channels user has access to

Used conversations.list with Bearer token

✅ To-Do (For Improvement)
 Add login/session support per Slack workspace

 Use Redis or Bull for more robust job queuing

 Add email alerts/reminders

<br>

This is a slack based application which can be used to schedule messages between a combination of different channels, users or groups irrespective of the timezone. <br>

### Build Instructions<br>
Run `npm install` to install dependencies and you have to set the `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET` as env variables as it is used inside the application.<br>

After that you can run the application by `node app.js`<br>

### Usage Instructions<br>
Search for Scheduler in the global shortcut<br>

![image](https://user-images.githubusercontent.com/47693983/224338973-ee5cba98-7da0-4e28-800b-a0554d1e7823.png)

Type in the message and select the channels/groups/users as receivers

![image](https://user-images.githubusercontent.com/47693983/224339549-219e9660-9591-4740-bae0-c2b95b8fc5db.png)

Select Date, Time and Timezone for sending the message.

![image](https://user-images.githubusercontent.com/47693983/224340000-4e0a8400-3dc1-4ac6-bbfc-53564d49ecd9.png)

Click on Submit. 
