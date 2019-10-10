/// <reference types="react-scripts" />

module "glur" {
  const glur: (
    src: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number
  ) => void;

  export default glur;
}
