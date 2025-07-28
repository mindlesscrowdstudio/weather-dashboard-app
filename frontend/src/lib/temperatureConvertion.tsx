

export const convertToFahrenheit = (celsius:number): number => {
  if(typeof celsius !== 'number') return NaN;
  return Math.round((celsius * 9/5 + 32));
};
