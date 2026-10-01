const sharp = require('sharp');
const path = require('path');

async function removeWhiteBackground() {
  const inputPath = path.join(__dirname, '..', 'public', 'logo.jpg');
  const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

  // Carrega imagem e obtém dados brutos RGBA
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 238; // Nível para considerar branco puro
  const feather = 18;    // Suavização das bordas para anti-aliasing perfeito

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Se for branco ou quase branco
    const brightness = Math.min(r, g, b);
    if (brightness >= threshold) {
      data[i + 3] = 0; // Transparente
    } else if (brightness > threshold - feather) {
      // Suavização de borda
      const factor = (threshold - brightness) / feather;
      data[i + 3] = Math.round(factor * 255);
    }
  }

  // Salva como PNG com transparência e recorta espaços vazios ao redor
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .trim() // Remove o excesso de borda vazia
  .png({ quality: 100 })
  .toFile(outputPath);

  console.log('Logo sem fundo gerado com sucesso em:', outputPath);
}

removeWhiteBackground().catch(console.error);
