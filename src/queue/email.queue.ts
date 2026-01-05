import Queue from 'bull'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const redisUrl = process.env.REDIS_URL
const isProduction = process.env.NODE_ENV === 'production'

const emailQueue = redisUrl
  ? new Queue('email', redisUrl, {
      redis: isProduction
        ? {
            tls: { rejectUnauthorized: false },
          }
        : undefined,
    })
  : new Queue('email', {
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    })

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Server Connection Error:', error)
  } else {
    console.log('✅ Email Server Ready to send messages')
  }
})

emailQueue.process(async (job, done) => {
  try {
    const { to, subject, text } = job.data
    console.log(`📨 Processing email for: ${to}`)

    const info = await transporter.sendMail({
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<div>${text}</div>`,
    })

    console.log(`✅ Email sent: ${info.messageId}`)
    done()
  } catch (error: any) {
    console.error('❌ Failed to send email:', error)
    done(error)
  }
})

emailQueue.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed!`)
})

emailQueue.on('failed', (job, err) => {
  console.log(`⚠️ Job ${job.id} failed:`, err)
})

export const sendEmail = (to: string, subject: string, text: string) => {
  console.log(`📥 Adding email to queue for: ${to}`)
  emailQueue.add(
    { to, subject, text },
    {
      attempts: 3,
      backoff: 5000,
    }
  )
}
