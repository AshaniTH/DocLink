const hasSmtp = !!(process.env.SMTP_USER && process.env.SMTP_PASS)
let transporter = null

if (hasSmtp) {
    try {
        // top-level await is supported in ESM; dynamically import to avoid crash when package missing
        const { default: nodemailer } = await import('nodemailer')
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '',
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    } catch (err) {
        console.log('nodemailer not available or failed to load; falling back to console. Error:', err && err.message)
        transporter = null
    }
} else {
    console.log('SMTP not configured — emails will be printed to console')
}

const sendMail = async ({ to, subject, html, text }) => {
    if (!hasSmtp || !transporter) {
        console.log('Mail (console fallback) — to:', to, 'subject:', subject)
        if (text) console.log('text:', text)
        if (html) console.log('html:', html)
        return
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
    }

    return transporter.sendMail(mailOptions)
}

export default sendMail
