import api from '../services/api';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const getProductImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/150';
  
  let formattedUrl = url;

  // If relative path, prepend API server host
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[0]) {
          const rootUrl = matches[0];
          const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
          formattedUrl = `${rootUrl}${cleanPath}`;
        }
      }
    } catch (e) {
      console.log('Error prepending base URL for product image:', e);
    }
  }

  // Translate local network IP addresses to the active API server IP dynamically
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
        if (localIpRegex.test(formattedUrl)) {
          formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
        }
      }
    }
  } catch (e) {
    console.log('Error parsing host for product IP redirection in admin:', e);
  }

  if (formattedUrl.startsWith('https://images.unsplash.com')) return formattedUrl;
  
  if (formattedUrl.includes('/uploads/product_') && !formattedUrl.includes('/uploads/products/')) {
    return formattedUrl.replace('/uploads/product_', '/uploads/products/product_');
  }
  return formattedUrl;
};

export const getSellerImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/150';
  
  let formattedUrl = url;

  // If relative path, prepend API server host
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    try {
      const apiBaseURL = api.defaults.baseURL;
      if (apiBaseURL) {
        const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
        if (matches && matches[0]) {
          const rootUrl = matches[0];
          const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
          formattedUrl = `${rootUrl}${cleanPath}`;
        }
      }
    } catch (e) {
      console.log('Error prepending base URL for seller image:', e);
    }
  }

  // Translate local network IP addresses to the active API server IP dynamically
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      const matches = apiBaseURL.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
        if (localIpRegex.test(formattedUrl)) {
          formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
        }
      }
    }
  } catch (e) {
    console.log('Error parsing host for seller IP redirection in admin:', e);
  }

  if (formattedUrl.startsWith('https://images.unsplash.com')) return formattedUrl;
  
  if (formattedUrl.includes('/uploads/seller_') && !formattedUrl.includes('/uploads/sellers/')) {
    return formattedUrl.replace('/uploads/seller_', '/uploads/sellers/seller_');
  }
  return formattedUrl;
};
