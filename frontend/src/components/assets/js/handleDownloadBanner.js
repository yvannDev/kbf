import { toast } from "react-toastify";
  
  // les parametres la hauteur ,la largeur , et le nom du fichier (format png)
const handleDownloadBanner = (width, height, filename) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fond de couleur bleu
  ctx.fillStyle = "#1a56db";
  ctx.fillRect(0, 0, width, height);

  // Bande décorative bas
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // pour éviter que le texte déborde sur les bannières étroites
  const fontSize = Math.min(width * 0.18, height * 0.07);

  // Logo KBF
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.floor(fontSize * 1.8)}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("KBF", Math.floor(width * 0.06), Math.floor(height * 0.15));

  // Slogan — coupé en 2 lignes si nécessaire
  ctx.font = `${Math.floor(fontSize)}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("Invitez vos amis", Math.floor(width * 0.06), Math.floor(height * 0.28));
  ctx.fillText("et gagnez !", Math.floor(width * 0.06), Math.floor(height * 0.36));

  // Lien — coupé en 2 lignes
  ctx.font = `${Math.floor(fontSize * 0.75)}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText("kbf.com/register", Math.floor(width * 0.06), Math.floor(height * 0.50));
  ctx.fillText("?ref=b1234", Math.floor(width * 0.06), Math.floor(height * 0.57));

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  toast.success(`Bannière ${width}x${height} téléchargée !`);
};


export default handleDownloadBanner