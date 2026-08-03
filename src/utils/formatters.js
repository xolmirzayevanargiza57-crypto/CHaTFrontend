export const formatCount = (count) => {
    if (!count || isNaN(count)) return '0';
    
    const num = Number(count);
    
    if (num < 1000) return num.toString();
    
    if (num < 1000000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
    }
    
    if (num < 1000000000) {
        return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'm';
    }
    
    if (num < 1000000000000) {
        return (num / 1000000000).toFixed(num % 1000000000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'b';
    }
    
    return (num / 1000000000000).toFixed(num % 1000000000000 === 0 ? 0 : 1).replace(/\.0$/, '') + 't';
};
