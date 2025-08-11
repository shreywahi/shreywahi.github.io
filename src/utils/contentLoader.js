import { Code, Database, Globe, Smartphone, Shield } from 'lucide-react';
import defaultContentData from '../data/content.json';

// Single source of truth: local content
let contentData = defaultContentData;

// Local-only API
export const getLocalContent = () => defaultContentData;
export const getContent = () => contentData;

// Helpers preserved for UI
export const getIconComponent = (iconName) => {
  const iconMap = { Globe, Database, Code, Smartphone, Shield };
  return iconMap[iconName] || Globe;
};

export const getColorClasses = (color) => {
  return contentData.colorMap?.[color] || contentData.colorMap?.blue || '';
};

export const getIconColor = (color) => {
  return contentData.iconColorMap?.[color] || contentData.iconColorMap?.blue || '';
};

export const content = contentData;
export const hero = contentData.hero || {};
export const about = contentData.about || {};
export const experiences = contentData.experiences || [];
export const skillCategories = contentData.skillCategories || [];
export const projects = contentData.projects || [];
export const certificates = contentData.certificates || [];
export const contact = contentData.contact || {};

export const defaultHeroName = hero.name || 'Shrey Wahi';
export const defaultHeroDesc = hero.description || 'Software Engineer';
export const defaultAboutText = about.text || 'About me text';
export const defaultContactHeading = contact.heading || 'Contact Me';
export const defaultContactIntro = contact.intro || 'Get in touch';

export const certs = certificates;

export const clearContentCache = () => {
  contentData = defaultContentData;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cachedContent');
    }
  } catch {}
};
