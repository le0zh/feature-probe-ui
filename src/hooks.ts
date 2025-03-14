import { useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { useLocalStorage } from 'utils/hooks';

export const useI18N = () => {
  const localLanguage = navigator.language.toLocaleLowerCase().slice(0, 2);
  const defaultLanguage = localLanguage === 'zh' ? 'zh-CN' : 'en-US';
  const [i18n, setI18n] = useLocalStorage('i18n', defaultLanguage);

  return {
    i18n,
    setI18n,
  };
};

export const I18NContainer = createContainer(useI18N);

export const useRequestTimeCheck = () => {
  const requestTimes = useRef(new Map());

  const creatRequestTimeCheck = useCallback((key: string) => {
    const requestTime = Date.now();
    requestTimes.current.set(key, requestTime);

    const check = () => {
      return requestTimes.current.get(key) === requestTime;
    };

    return check;
  }, [requestTimes]);

  return creatRequestTimeCheck;
};
