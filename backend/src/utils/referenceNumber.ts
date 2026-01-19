export const generateReferenceNumber = (type: 'incoming' | 'outgoing'): string => {
  const prefix = type === 'incoming' ? 'W' : 'S';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${random}`;
};

