import * as nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()

class NotificationService {
  #SMTP_HOST = process.env.SMTP_HOST
  #SMTP_PORT = process.env.SMTP_PORT
  #SMTP_USER =  process.env.SMTP_USER
  #SMTP_PASSWORD = process.env.SMTP_PASSWORD
  #API_URL = process.env.API_URL
  #transporter

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: this.#SMTP_HOST,
      port: this.#SMTP_PORT,
      secure: false,
      auth: {
        user: this.#SMTP_USER,
        pass: this.#SMTP_PASSWORD
      }
    })
  }

  async sendActivationMail(to, link) {
    await this.#transporter.sendMail({
      from: "niko8elich@gmail.com",
      to: to,
      subject: 'Account activate <wallet_app>',
      text: '',
      html:
        `
          <div>
            <h1>Click to activate: </h1>
            <a href='${link}'>${link}</a>
          </div>
        `
    })
    this.#transporter
      .verify()
      .then(console.log)
      .catch(console.error);

    return
  }

  async send2faEmailCode(email, code){
    await this.#transporter.sendMail({
      from: this.#SMTP_USER,
      to: email,
      subject: 'Authentication',
      text: '',
      html:
        `
          <div>
            <h1>Authentication code: </h1>
            <div>${code}</div>
          </div>
        `
    })
    this.#transporter
    .verify()
    .then(console.log)
    .catch(console.error);

    return
  }

  async send2faTelegramCode(chatId, code){

    // send code to tg here < --
    console.log("data -> ", chatId, code);

    return
  }

}

export default new NotificationService();