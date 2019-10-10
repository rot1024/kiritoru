import glur from "glur";

export default (
  canvas?: HTMLCanvasElement,
  sigma: number = 1.5,
  shadow: number = 150
) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let img2 = ctx.getImageData(0, 0, canvas.width, canvas.height);

  glayscale(img);
  glayscale(img2);
  invert(img2);
  blur(img2, sigma);
  colorDodge(img, img2);
  levels(img, shadow);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(img, 0, 0, 0, 0, canvas.width, canvas.height);
};

const glayscale = (img: ImageData) => {
  for (let i = 0; i < Math.floor(img.data.length / 4); i++) {
    const r = img.data[i * 4];
    const g = img.data[i * 4 + 1];
    const b = img.data[i * 4 + 2];
    const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = l;
  }
};

const invert = (img: ImageData) => {
  for (let i = 0; i < Math.floor(img.data.length / 4); i++) {
    img.data[i * 4] = 255 - img.data[i * 4];
    img.data[i * 4 + 1] = 255 - img.data[i * 4 + 1];
    img.data[i * 4 + 2] = 255 - img.data[i * 4 + 2];
  }
};

const blur = (img: ImageData, sigma: number) => {
  glur(img.data, img.width, img.height, sigma);
};

const colorDodge = (img: ImageData, imgtop: ImageData) => {
  for (let i = 0; i < Math.floor(img.data.length / 4); i++) {
    const bl = img.data[i * 4] / 255;
    const tl = imgtop.data[i * 4] / 255;
    let l = tl === 1 ? 1 : bl / (1.0 - tl);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] =
      Math.min(1, l) * 255;
  }
};

const levels = (img: ImageData, shadow: number) => {
  const s = shadow / 255;
  const b = 1 - s;
  for (let i = 0; i < Math.floor(img.data.length / 4); i++) {
    const l = img.data[i * 4] / 255;
    let nl = s === 0 ? (l === 1 ? 1 : 0) : l <= s ? 0 : (l - s) / b;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = nl * 255;
  }
};
