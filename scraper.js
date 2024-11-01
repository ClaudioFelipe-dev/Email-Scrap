require('dotenv').config(); 

const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const URL = `https://www.flashscore.com.br/basquete/`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

(async () => {
  const nav = await puppeteer.launch();
  const pagina = await nav.newPage();

  await pagina.goto(URL, { waitUntil: "networkidle2" });
  await pagina.screenshot({ path: "./print.jpeg" });

  let data = await pagina.evaluate(() => {
    const times = [];
    const participantes = document.querySelectorAll(".event__participant");

    participantes.forEach((participante) => {
      times.push(participante.innerText);
    });

    return { times };
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use a variável de ambiente
    to: "kashilindo@gmail.com",
    subject: "Resultados do Basquete",
    text: `Os times são: ${data.times.join(", ")}`,
    attachments: [
      {
        path: "./print.jpeg", // Anexa a captura de tela
      },
    ],
  };

  // Enviar o email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Erro ao enviar email: ", error);
    }
    console.log("Email enviado: " + info.response);
  });

  console.log(data);

  await nav.close();
})();
