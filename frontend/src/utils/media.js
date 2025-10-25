import { API_ROOT } from './constants';

// Resolve an image reference to an absolute URL.
// image can be:
// - string: '/uploads/...' or 'https://...'
// - object: { url, public_id }
export const resolveImageUrl = (image) => {
  if (!image) return '';

  // If it's already a full URL
  if (typeof image === 'string') {
    if (/^https?:\/\//i.test(image)) return image;
    // relative path -> prefix with API_ROOT
    return `${API_ROOT}${image}`;
  }

  if (typeof image === 'object') {
    if (image.url) return image.url;
    if (image.path) {
      if (/^https?:\/\//i.test(image.path)) return image.path;
      return `${API_ROOT}${image.path}`;
    }
  }

  return '';
};
