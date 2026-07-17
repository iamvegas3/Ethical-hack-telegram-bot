// index.js - Telegram Bot for "Ethical x - hacks"
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const session = require('telegraf/session');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const ADMIN_SECRET = '2026';
const PAYMENT_ACCOUNT = '6572821960';
const PAYMENT_BANK = 'OPay';
const PAYMENT_NAME = 'ABDULSAMAD AYOMIDE SALAUDEEN';

// Initialize bot and express app
const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

// Store projects and user data (in production, use a database)
let projects = [
    { name: '📊 Advanced Analytics Dashboard', status: 'active' },
    { name: '🤖 Auto-Reply Engine Pro', status: 'active' },
    { name: '📈 Premium Trading Signals', status: 'active' },
    { name: '🔮 AI Prediction Model v2', status: 'beta' },
    { name: '🛡️ Ethical Hacking Toolkit', status: 'active' },
    { name: '💻 Penetration Testing Suite', status: 'beta' },
    { name: '🔍 Vulnerability Scanner Pro', status: 'active' },
    { name: '🌐 Network Security Analyzer', status: 'beta' }
];

// User data store (in production, use a database)
const userData = new Map(); // user_id -> { paid: boolean, joined: date }

// Session middleware
bot.use(session());

// Helper functions
function getDefaultProjects() {
    return [
        { name: '📊 Advanced Analytics Dashboard', status: 'active' },
        { name: '🤖 Auto-Reply Engine Pro', status: 'active' },
        { name: '📈 Premium Trading Signals', status: 'active' },
        { name: '🔮 AI Prediction Model v2', status: 'beta' },
        { name: '🛡️ Ethical Hacking Toolkit', status: 'active' },
        { name: '💻 Penetration Testing Suite', status: 'beta' },
        { name: '🔍 Vulnerability Scanner Pro', status: 'active' },
        { name: '🌐 Network Security Analyzer', status: 'beta' }
    ];
}

function getUserProjects(userId) {
    const user = userData.get(userId);
    if (user && user.paid) {
        return projects;
    }
    return null;
}

function isAdmin(userId) {
    // In production, you'd check against a list of admin IDs
    // For now, we use the secret code approach
    return false;
}

// Bot commands
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    // Track user
    if (!userData.has(userId)) {
        userData.set(userId, { 
            paid: false, 
            joined: new Date(),
            username: ctx.from.username
        });
    }

    const welcomeText = `
🎯 *Welcome to Ethical x - hacks Bot* 🔥

Hello ${userName}! We provide premium hacking and cybersecurity tools.

💎 *PREMIUM FEATURES:*
• Advanced penetration testing tools
• Ethical hacking frameworks
• Security vulnerability scanners
• Professional grade exploits
• Network security analyzers

📌 *How to get access:*
1. Send payment to the account below
2. Click "Verify Payment" after payment
3. Get instant access to all tools

💰 *Payment Details:*
Account: \`${PAYMENT_ACCOUNT}\`
Bank: ${PAYMENT_BANK}
Name: ${PAYMENT_NAME}

💵 Price: $50 (or equivalent in your currency)

*Commands:*
/start - Show this menu
/projects - View available projects (after payment)
/verify - Verify your payment
/pay - Show payment details
/admin - Admin panel (secret code required)
/about - About this bot
`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💳 Payment Details', 'pay')],
        [Markup.button.callback('📁 Projects', 'projects')],
        [Markup.button.callback('✅ Verify Payment', 'verify')],
        [Markup.button.callback('ℹ️ About', 'about')]
    ]);

    await ctx.replyWithMarkdown(welcomeText, keyboard);
});

bot.command('pay', async (ctx) => {
    const paymentText = `
💳 *Payment Details*

Bank: ${PAYMENT_BANK}
Account Number: \`${PAYMENT_ACCOUNT}\`
Account Name: ${PAYMENT_NAME}

*Steps:*
1. Transfer the exact amount to the account above
2. Take a screenshot of your payment
3. Click "Verify Payment" or send /verify
4. Wait for confirmation

⚠️ *Important:*
• Include your Telegram username in the payment description
• We verify all payments within 24 hours
• No refunds after access is granted
`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Verify Payment', 'verify')],
        [Markup.button.callback('🔙 Back to Menu', 'back')]
    ]);

    await ctx.replyWithMarkdown(paymentText, keyboard);
});

bot.command('projects', async (ctx) => {
    const userId = ctx.from.id;
    const userProjects = getUserProjects(userId);

    if (userProjects) {
        const projectList = userProjects.map(p => `• ${p.name} (${p.status})`).join('\n');
        const response = `
📁 *Available Projects*

Here are all the premium projects you have access to:

${projectList}

*Total Projects:* ${userProjects.length}
*Status:* ✅ Active

To use any project, just click on it or send the project name.
`;
        await ctx.replyWithMarkdown(response);
    } else {
        const response = `
🔒 *Access Denied*

You haven't paid for premium access yet.

💳 Please make payment to:
Account: \`${PAYMENT_ACCOUNT}\`
Bank: ${PAYMENT_BANK}
Name: ${PAYMENT_NAME}

After payment, click "Verify Payment" to get access.
`;
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('✅ Verify Payment', 'verify')],
            [Markup.button.callback('💳 Payment Details', 'pay')]
        ]);
        await ctx.replyWithMarkdown(response, keyboard);
    }
});

bot.command('verify', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Confirm Payment', 'confirm_payment')],
        [Markup.button.callback('❌ Cancel', 'cancel')]
    ]);

    await ctx.replyWithMarkdown(
        `📝 *Payment Verification*\n\nPlease confirm that you've made payment to:\n\nAccount: \`${PAYMENT_ACCOUNT}\`\nBank: ${PAYMENT_BANK}\nName: ${PAYMENT_NAME}\n\nIf you've already paid, click 'Confirm Payment' to get access.`,
        keyboard
    );
});

bot.command('admin', async (ctx) => {
    const parts = ctx.message.text.split(' ');
    if (parts.length < 2) {
        await ctx.replyWithMarkdown(
            '🔐 *Admin Access*\n\nPlease provide the secret code:\n`/admin <code>`\n\nExample: `/admin 2026`'
        );
        return;
    }

    const secret = parts[1];
    if (secret === ADMIN_SECRET) {
        const adminText = `
👑 *Admin Panel - Ethical x - hacks*

*Commands:*
/add <project_name> - Add new project
/remove <project_name> - Remove a project
/list - List all projects
/reset - Reset to default projects
/stats - Show bot statistics
/users - Show user statistics

*Current Projects:*
${projects.map(p => `• ${p.name} (${p.status})`).join('\n')}
`;

        await ctx.replyWithMarkdown(adminText);
    } else {
        await ctx.replyWithMarkdown('❌ *Invalid secret code*');
    }
});

bot.command('add', async (ctx) => {
    const parts = ctx.message.text.split(' ');
    if (parts.length < 2) {
        await ctx.replyWithMarkdown(
            '❌ *Usage:* `/add <project_name>`\n\nExample: `/add New Security Tool`'
        );
        return;
    }

    const projectName = parts.slice(1).join(' ').trim();
    
    if (projects.some(p => p.name === projectName)) {
        await ctx.replyWithMarkdown(`❌ Project '${projectName}' already exists!`);
        return;
    }

    projects.push({ name: projectName, status: 'active' });
    await ctx.replyWithMarkdown(
        `✅ *Project Added*\n\n${projectName} has been added to the premium list!\n\nTotal projects: ${projects.length}`
    );
});

bot.command('remove', async (ctx) => {
    const parts = ctx.message.text.split(' ');
    if (parts.length < 2) {
        await ctx.replyWithMarkdown(
            '❌ *Usage:* `/remove <project_name>`\n\nExample: `/remove Old Tool`'
        );
        return;
    }

    const projectName = parts.slice(1).join(' ').trim();
    const index = projects.findIndex(p => p.name === projectName);
    
    if (index === -1) {
        await ctx.replyWithMarkdown(`❌ Project '${projectName}' not found!`);
        return;
    }

    projects.splice(index, 1);
    await ctx.replyWithMarkdown(`✅ *Project Removed*\n\n${projectName} has been removed from the premium list.`);
});

bot.command('list', async (ctx) => {
    if (projects.length === 0) {
        await ctx.replyWithMarkdown('📭 No projects available.');
        return;
    }

    const projectList = projects.map(p => `• ${p.name} (${p.status})`).join('\n');
    await ctx.replyWithMarkdown(
        `📋 *All Projects*\n\n${projectList}\n\n*Total:* ${projects.length} projects`
    );
});

bot.command('reset', async (ctx) => {
    projects = getDefaultProjects();
    await ctx.replyWithMarkdown('✅ *Projects Reset*\n\nAll projects have been reset to default settings.');
});

bot.command('stats', async (ctx) => {
    const totalUsers = userData.size;
    const paidUsers = Array.from(userData.values()).filter(u => u.paid).length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const betaProjects = projects.filter(p => p.status === 'beta').length;

    await ctx.replyWithMarkdown(`
📊 *Bot Statistics*

*Users:*
• Total Users: ${totalUsers}
• Premium Users: ${paidUsers}
• Free Users: ${totalUsers - paidUsers}

*Projects:*
• Total Projects: ${projects.length}
• Active Projects: ${activeProjects}
• Beta Projects: ${betaProjects}

*Payment Details:*
• Account: ${PAYMENT_ACCOUNT}
• Bank: ${PAYMENT_BANK}
`);
});

bot.command('users', async (ctx) => {
    if (userData.size === 0) {
        await ctx.replyWithMarkdown('📊 No users yet.');
        return;
    }

    let userList = '👥 *User List*\n\n';
    for (const [userId, data] of userData) {
        const status = data.paid ? '✅ Premium' : '⬜ Free';
        const username = data.username || userId;
        userList += `• ${username} - ${status}\n`;
    }

    await ctx.replyWithMarkdown(userList);
});

bot.command('about', async (ctx) => {
    await ctx.replyWithMarkdown(`
🤖 *About Ethical x - hacks Bot*

This bot provides premium hacking and cybersecurity tools.

*Version:* 2.0.0
*Created:* 2026
*Status:* 🟢 Online

*Features:*
• Premium hacking tools
• Cybersecurity frameworks
• Vulnerability scanners
• Professional exploits
• Network security tools

*Support:*
For support, contact @admin

*Security Note:*
All tools are for educational purposes only.
`);
});

// Callback queries
bot.action('pay', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(`
💳 *Payment Details*

Bank: ${PAYMENT_BANK}
Account Number: \`${PAYMENT_ACCOUNT}\`
Account Name: ${PAYMENT_NAME}

*Steps:*
1. Transfer the exact amount to the account above
2. Take a screenshot of your payment
3. Click "Verify Payment" or send /verify
4. Wait for confirmation

⚠️ *Important:*
• Include your Telegram username in the payment description
• We verify all payments within 24 hours
• No refunds after access is granted
`);
});

bot.action('projects', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userProjects = getUserProjects(userId);

    if (userProjects) {
        const projectList = userProjects.map(p => `• ${p.name} (${p.status})`).join('\n');
        await ctx.replyWithMarkdown(`
📁 *Available Projects*

${projectList}

*Total Projects:* ${userProjects.length}
*Status:* ✅ Active
`);
    } else {
        await ctx.replyWithMarkdown(`
🔒 *Access Denied*

You haven't paid for premium access yet.

💳 Please make payment to:
Account: \`${PAYMENT_ACCOUNT}\`
Bank: ${PAYMENT_BANK}
Name: ${PAYMENT_NAME}

After payment, click "Verify Payment" to get access.
`);
    }
});

bot.action('verify', async (ctx) => {
    await ctx.answerCbQuery();
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Confirm Payment', 'confirm_payment')],
        [Markup.button.callback('❌ Cancel', 'cancel')]
    ]);

    await ctx.replyWithMarkdown(
        `📝 *Payment Verification*\n\nPlease confirm that you've made payment to:\n\nAccount: \`${PAYMENT_ACCOUNT}\`\nBank: ${PAYMENT_BANK}\nName: ${PAYMENT_NAME}\n\nIf you've already paid, click 'Confirm Payment' to get access.`,
        keyboard
    );
});

bot.action('confirm_payment', async (ctx) => {
    await ctx.answerCbQuery('✅ Payment confirmed! Access granted!');
    
    const userId = ctx.from.id;
    if (!userData.has(userId)) {
        userData.set(userId, { paid: true, joined: new Date(), username: ctx.from.username });
    } else {
        const user = userData.get(userId);
        user.paid = true;
        userData.set(userId, user);
    }

    const projectList = projects.map(p => `• ${p.name}`).join('\n');
    await ctx.replyWithMarkdown(`
🎉 *Payment Confirmed!*

Welcome to the premium family! You now have access to all projects:

${projectList}

*Total Projects:* ${projects.length}

Use /projects to see them anytime.
`);
});

bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery('❌ Payment verification cancelled');
    await ctx.replyWithMarkdown('❌ Verification cancelled.');
});

bot.action('back', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    const welcomeText = `
🎯 *Welcome to Ethical x - hacks Bot* 🔥

Hello ${userName}! We provide premium hacking and cybersecurity tools.

💎 *PREMIUM FEATURES:*
• Advanced penetration testing tools
• Ethical hacking frameworks
• Security vulnerability scanners
• Professional grade exploits
• Network security analyzers

📌 *How to get access:*
1. Send payment to the account below
2. Click "Verify Payment" after payment
3. Get instant access to all tools

💰 *Payment Details:*
Account: \`${PAYMENT_ACCOUNT}\`
Bank: ${PAYMENT_BANK}
Name: ${PAYMENT_NAME}

💵 Price: $50 (or equivalent in your currency)

*Commands:*
/start - Show this menu
/projects - View available projects (after payment)
/verify - Verify your payment
/pay - Show payment details
/admin - Admin panel (secret code required)
/about - About this bot
`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💳 Payment Details', 'pay')],
        [Markup.button.callback('📁 Projects', 'projects')],
        [Markup.button.callback('✅ Verify Payment', 'verify')],
        [Markup.button.callback('ℹ️ About', 'about')]
    ]);

    await ctx.replyWithMarkdown(welcomeText, keyboard);
});

bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(`
🤖 *About Ethical x - hacks Bot*

This bot provides premium hacking and cybersecurity tools.

*Version:* 2.0.0
*Created:* 2026
*Status:* 🟢 Online

*Features:*
• Premium hacking tools
• Cybersecurity frameworks
• Vulnerability scanners
• Professional exploits
• Network security tools

*Support:*
For support, contact @admin

*Security Note:*
All tools are for educational purposes only.
`);
});

// Webhook endpoint
app.use(express.json());

app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body, res);
});

app.get('/', (req, res) => {
    res.send('🤖 Ethical x - hacks Bot is running!');
});

app.get('/set-webhook', async (req, res) => {
    try {
        const webhookUrl = `${req.protocol}://${req.get('host')}/webhook/${BOT_TOKEN}`;
        await bot.telegram.setWebhook(webhookUrl);
        res.send(`✅ Webhook set to: ${webhookUrl}`);
    } catch (error) {
        console.error('Error setting webhook:', error);
        res.status(500).send(`❌ Error: ${error.message}`);
    }
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('❌ An error occurred. Please try again later.');
});

// Start the server
if (process.env.NODE_ENV === 'development') {
    // Local development with polling
    bot.launch();
    console.log('🤖 Bot running in polling mode...');
} else {
    // Production with webhook
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🤖 Bot is ready for webhook connections`);
    });
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = app;
