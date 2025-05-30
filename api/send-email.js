import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // S'assurer que la requête est bien une méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupérer les données du formulaire
  const { name, email, subject, message } = req.body;

  // Vérifier que toutes les données nécessaires sont présentes
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Configuration de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Options de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contact.etudly@gmail.com',
      subject: `Nouveau message de ${name}: ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`,
      replyTo: email
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Réponse réussie
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
}