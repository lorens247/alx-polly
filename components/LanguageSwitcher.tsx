'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    router.push(`/${lang}`);
  };

  return (
    <select onChange={handleChange} value={i18n.language}>
      <option value="en">English</option>
      <option value="yo">Yorùbá</option>
      <option value="bin">Bini</option>
      <option value="ig">Igbo</option>
      <option value="ha">Hausa</option>
      <option value="pcm">Pidgin</option>
    </select>
  );
};

export default LanguageSwitcher;
