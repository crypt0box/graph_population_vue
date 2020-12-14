export const getRandomColor = () => {
  const color = (Math.random() * 0xFFFFFF | 0).toString(16);
  const randomColor = '#' + ('000000' + color).slice(-6);
  return randomColor;
}