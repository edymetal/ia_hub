import "./globals.css";

export const metadata = {
  title: "Multi-AI Truth Verifier",
  description: "Faça uma pergunta e receba respostas de 5 IAs, com um veredito final de uma IA Juíza.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
