const sendEmail = require('../../utils/sendMail');

const appName = 'Taskopia';
const appUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const formatAmount = (amount) => {
    if (amount === undefined || amount === null || amount === '') return 'Not specified';
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

const buildEmail = ({ title, greeting, paragraphs = [], action }) => {
    const body = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const button = action
        ? `<p><a href="${escapeHtml(action.href)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(action.label)}</a></p>`
        : '';

    return `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:auto;padding:24px;">
            <h2 style="margin:0 0 16px;">${escapeHtml(title)}</h2>
            <p>${escapeHtml(greeting)}</p>
            ${body}
            ${button}
            <p style="margin-top:24px;color:#6b7280;font-size:13px;">Thanks,<br/>Team ${appName}</p>
        </div>
    `;
};

const sendActionMail = ({ to, subject, greeting, paragraphs, action }) => {
    if (!to) {
        console.warn(`Skipping "${subject}" email because receiver email is missing.`);
        return Promise.resolve(null);
    }

    const text = [greeting, ...paragraphs, action ? `${action.label}: ${action.href}` : null, `Team ${appName}`]
        .filter(Boolean)
        .join('\n\n');

    const html = buildEmail({ title: subject, greeting, paragraphs, action });
    return sendEmail(to, subject, text, html);
};

const sendRegistrationMail = ({ to, userName = 'there', userType }) =>
    sendActionMail({
        to,
        subject: 'Welcome to Taskopia',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `Your ${userType || 'user'} account has been created successfully.`,
            'You can now complete your profile and start using Taskopia.'
        ],
        action: { label: 'Open Taskopia', href: appUrl }
    });

const sendTaskCreatedMail = ({ to, hostName = 'there', taskTitle, budget }) =>
    sendActionMail({
        to,
        subject: 'Your task has been posted',
        greeting: `Hi ${hostName},`,
        paragraphs: [
            `Your task "${taskTitle}" is now live on Taskopia.`,
            `Budget: ${formatAmount(budget)}.`,
            'Allies can now find and apply for this task.'
        ],
        action: { label: 'View dashboard', href: `${appUrl}/host/dashboard` }
    });

const sendTaskApplicationSubmittedMail = ({ to, allyName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Application submitted',
        greeting: `Hi ${allyName},`,
        paragraphs: [
            `Your application for "${taskTitle}" has been submitted successfully.`,
            'We will let you know when the host makes a decision.'
        ],
        action: { label: 'View applications', href: `${appUrl}/ally/dashboard` }
    });

const sendNewApplicantMail = ({ to, hostName = 'there', allyName = 'An ally', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'New application received',
        greeting: `Hi ${hostName},`,
        paragraphs: [
            `${allyName} applied for your task "${taskTitle}".`,
            'Review the application and accept or reject it from your dashboard.'
        ],
        action: { label: 'Review applications', href: `${appUrl}/host/dashboard` }
    });

const sendApplicationAcceptedMail = ({ to, allyName = 'there', taskTitle, hostName = 'the host' }) =>
    sendActionMail({
        to,
        subject: 'Your application was accepted',
        greeting: `Hi ${allyName},`,
        paragraphs: [
            `${hostName} accepted your application for "${taskTitle}".`,
            'You can now coordinate with the host and start the task.'
        ],
        action: { label: 'View task', href: `${appUrl}/ally/dashboard` }
    });

const sendApplicationRejectedMail = ({ to, allyName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Application update',
        greeting: `Hi ${allyName},`,
        paragraphs: [
            `Your application for "${taskTitle}" was not selected this time.`,
            'Keep exploring other tasks that match your skills.'
        ],
        action: { label: 'Find more tasks', href: `${appUrl}/job/listings` }
    });

const sendHostAcceptedApplicationMail = ({ to, hostName = 'there', allyName = 'the ally', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Ally accepted for your task',
        greeting: `Hi ${hostName},`,
        paragraphs: [
            `You accepted ${allyName} for "${taskTitle}".`,
            'The task has been moved to assigned status.'
        ],
        action: { label: 'View dashboard', href: `${appUrl}/host/dashboard` }
    });

const sendTaskUpdatedMail = ({ to, userName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Task details updated',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `The task "${taskTitle}" has updated details.`,
            'Please review the latest task information in your dashboard.'
        ],
        action: { label: 'Open dashboard', href: appUrl }
    });

const sendTaskDeletedMail = ({ to, userName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Task deleted',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `The task "${taskTitle}" has been deleted.`,
            'Any related pending applications are no longer active.'
        ],
        action: { label: 'Open Taskopia', href: appUrl }
    });

const sendApplicationCancelledMail = ({ to, userName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Application cancelled',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `The application for "${taskTitle}" has been cancelled.`,
            'You can check the latest status in your dashboard.'
        ],
        action: { label: 'Open dashboard', href: appUrl }
    });

const sendCompletionRequestedMail = ({ to, hostName = 'there', allyName = 'The ally', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Task completion requested',
        greeting: `Hi ${hostName},`,
        paragraphs: [
            `${allyName} requested completion approval for "${taskTitle}".`,
            'Please review the task and mark it completed when everything looks good.'
        ],
        action: { label: 'Review task', href: `${appUrl}/host/dashboard` }
    });

const sendTaskCompletedMail = ({ to, userName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Task completed',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `The task "${taskTitle}" has been marked as completed.`,
            'Thanks for using Taskopia.'
        ],
        action: { label: 'Open dashboard', href: appUrl }
    });

const sendTaskCancelledMail = ({ to, userName = 'there', taskTitle }) =>
    sendActionMail({
        to,
        subject: 'Task cancelled',
        greeting: `Hi ${userName},`,
        paragraphs: [
            `The task "${taskTitle}" has been cancelled.`,
            'Please check your dashboard for the latest status.'
        ],
        action: { label: 'Open dashboard', href: appUrl }
    });

module.exports = {
    sendRegistrationMail,
    sendTaskCreatedMail,
    sendTaskApplicationSubmittedMail,
    sendNewApplicantMail,
    sendApplicationAcceptedMail,
    sendApplicationRejectedMail,
    sendHostAcceptedApplicationMail,
    sendTaskUpdatedMail,
    sendTaskDeletedMail,
    sendApplicationCancelledMail,
    sendCompletionRequestedMail,
    sendTaskCompletedMail,
    sendTaskCancelledMail
};
