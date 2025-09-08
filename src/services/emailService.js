const nodemailer = require("nodemailer");
const { logError } = require("../middleware/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function verifyConnection() {
  try {
    await transporter.verify();
    console.log("✅ Servidor de correo conectado correctamente");
    return true;
  } catch (error) {
    console.error(
      "❌ Error al conectar con el servidor de correo:",
      error.message
    );
    return false;
  }
}

async function sendWelcomeEmail(email, userName = "Usuario") {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "¡Bienvenido a API Login! 🎉",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">¡Bienvenido ${userName}!</h2>
                    <p>Tu cuenta ha sido creada exitosamente en nuestra plataforma.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Detalles de tu cuenta:</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString(
                          "es-ES"
                        )}</p>
                    </div>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Este es un mensaje automático, por favor no respondas a este correo.
                    </p>
                </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo de bienvenida enviado:", info.messageId);
    return true;
  } catch (error) {
    await logError(
      "REGISTER-ERROR",
      null,
      `Error al enviar correo de bienvenida: ${error.message}`
    );
    return false;
  }
}

async function sendPasswordResetEmail(email, resetToken) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Contraseña temporal - API Login 🔐",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FF9800;">Contraseña temporal generada</h2>
                    <p>Has solicitado restablecer tu contraseña. Te hemos generado una contraseña temporal.</p>
                    
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p><strong>⚠️ Importante:</strong> Esta contraseña temporal es válida por 1 hora.</p>
                    </div>
                    
                    <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #007bff;">
                        <h3 style="color: #007bff; margin-top: 0;">Tu contraseña temporal:</h3>
                        <p style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; background-color: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; margin: 10px 0;">
                            ${resetToken}
                        </p>
                    </div>
                    
                    <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <h4 style="color: #721c24; margin-top: 0;">Instrucciones:</h4>
                        <ol style="color: #721c24;">
                            <li>Usa esta contraseña temporal para iniciar sesión</li>
                            <li>El sistema te pedirá cambiar la contraseña inmediatamente</li>
                            <li>Esta contraseña expira en 1 hora</li>
                            <li>Solo puede usarse una vez</li>
                        </ol>
                    </div>
                    
                    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0c5460;">
                        <p style="color: #0c5460; margin: 0;">
                            <strong>Seguridad:</strong> Si no solicitaste este cambio, ignora este correo. 
                            La contraseña expirará automáticamente.
                        </p>
                    </div>
                    
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Este es un mensaje automático, por favor no respondas a este correo.
                    </p>
                </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo de contraseña temporal enviado:", info.messageId);
    return true;
  } catch (error) {
    await logError(
      "FORGOT-PASSWORD-ERROR",
      null,
      `Error al enviar correo de contraseña temporal: ${error.message}`
    );
    return false;
  }
}

module.exports = {
  verifyConnection,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
