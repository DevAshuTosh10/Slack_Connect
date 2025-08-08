// Imports

require('dotenv').config();
const express = require('express');
const path = require('path');
const { App } = require("@slack/bolt");
const fs = require("fs");
const { messageModal1, newModal, helloModal } = require("./ui");
const fire_message = require("./fire_message");
const bodyParser = require('body-parser');

// Express server setup for frontend
const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.json()); // to parse JSON body

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 👉 POST endpoint for receiving form data from frontend
server.post('/api/schedule-message', async (req, res) => {
  const { msg, date, time, tzone, recipientIds } = req.body;

  if (!msg || !date || !time || !tzone || !recipientIds || !recipientIds.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Categorize recipients
  const categorizedRecipients = {
    users: [],
    channels: [],
    groups: []
  };

  for (const id of recipientIds) {
    if (id.startsWith("U")) {
      categorizedRecipients.users.push(id);
    } else if (id.startsWith("C")) {
      categorizedRecipients.channels.push(id);
    } else if (id.startsWith("G")) {
      categorizedRecipients.groups.push(id);
    }
  }

  const messageObj = { msg, date, time, tzone };

  try {
    await fire_message(messageObj, categorizedRecipients, slackClient, "admin"); // Admin fallback
    res.json({ success: true, message: "Scheduled successfully!" });
  } catch (error) {
    console.error("Error scheduling message:", error);
    res.status(500).json({ error: "Failed to schedule message" });
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Frontend server running at http://localhost:${PORT}`);
});

// Slack Bolt App Configuration
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  port: false
});

const slackClient = app.client; // Save client for later use

// --- Slack Listeners (unchanged) ---

const recipients = { users: [], channels: [], groups: [] };
const message = { date: "", time: "", tzone: "", msg: "" };

app.shortcut("g_schedule", async ({ shortcut, ack, client }) => {
  await ack();
  try {
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: messageModal1
    });
  } catch (error) {
    console.error("Error opening shortcut view:", error);
  }
});

app.message("hello", async ({ message, say }) => {
  helloModal.text = `Hey there <@${message.user}>!`;
  await say(helloModal);
});

app.action("button_click", async ({ body, ack, client }) => {
  await ack();
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: messageModal1
    });
  } catch (error) {
    console.error("Error opening modal on button click:", error);
  }
});

app.action("multi_conversations_select-action", async ({ body, ack }) => {
  await ack();
  recipients.users = [];
  recipients.channels = [];
  recipients.groups = [];

  for (let i of body.actions[0].selected_conversations) {
    if (i.startsWith('U')) {
      recipients.users.push(i);
    } else if (i.startsWith('C')) {
      recipients.channels.push(i);
    } else if (i.startsWith('G')) {
      recipients.groups.push(i);
    }
  }

  recipients.users = [...new Set(recipients.users)];
  recipients.channels = [...new Set(recipients.channels)];
  recipients.groups = [...new Set(recipients.groups)];
});

app.view('selected', async ({ ack, view }) => {
  const blockId = Object.keys(view.state.values)[0];
  message.msg = view.state.values[blockId][Object.keys(view.state.values[blockId])[0]].value;
  newModal.blocks[2].text.text = `\`\`\`${message.msg}\`\`\``;

  await ack({
    response_action: 'update',
    view: newModal,
  });
});

app.view("reminder_set", async ({ ack, view, body, client }) => {
  await ack();

  message.date = view.state.values['datepicker-block']?.['datepicker-action']?.selected_date;
  message.time = view.state.values['timepicker-block']?.['timepicker-action']?.selected_time;
  message.tzone = view.state.values['timezone-block']?.['static_select-action']?.selected_option?.value;

  fire_message(message, recipients, client, body.user.id);
});

// Start Slack App without its own HTTP server
(async () => {
  await app.start();
  console.log("⚡ Slack app connected");
})();
