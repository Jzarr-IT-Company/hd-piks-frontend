import videosImg from '../assets/01_Videos_4K.png';
import imagesImg from '../assets/02_Images_4K.png';
import aiImagesImg from '../assets/05_AI_Images_4K.png';
import textVoiceoverRaw from './ai-articles/ai-text-voiceover.txt?raw';
import bgRemoveRaw from './ai-articles/ai-bg-remove.txt?raw';
import imageGeneratorRaw from './ai-articles/ai-generator.txt?raw';
import videoGeneratorRaw from './ai-articles/ai-video-generator.txt?raw';

const toParagraphs = (raw = '') =>
  String(raw)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const buildArticle = (raw, image, fallbackTitle) => {
  const paragraphs = toParagraphs(raw);
  return {
    title: paragraphs[0] || fallbackTitle,
    image,
    paragraphs: paragraphs.slice(1),
  };
};

export const AI_TOOL_ARTICLES = {
  'ai-text-voiceover': buildArticle(textVoiceoverRaw, videosImg, 'What is AI Text Voiceover?'),
  'ai-bg-remove': buildArticle(bgRemoveRaw, imagesImg, 'What is AI Background Remover?'),
  'ai-generator': buildArticle(imageGeneratorRaw, aiImagesImg, 'Introduction to AI Image Generator'),
  'ai-video-generator': buildArticle(videoGeneratorRaw, videosImg, 'Introduction to AI Video Generator'),
};


