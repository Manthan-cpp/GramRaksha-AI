import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi', 'bn'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  console.log("getRequestConfig called with locale:", locale);
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    console.log("Locale missing or invalid:", locale);
    locale = 'en'; // Fallback to en instead of 404ing to avoid issues
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return {
      locale: locale as string,
      messages
    };
  } catch (error) {
    console.error("Error loading messages for locale:", locale, error);
    throw error;
  }
});
