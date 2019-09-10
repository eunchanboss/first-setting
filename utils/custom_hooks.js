import { useState, useCallback } from 'react';

/* 폼 입력을 받아 useState 를 처리. */
export const useInput = (initValue = null) => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((e) => {
    setter(e.target.value);
  }, []);
  return [value, handler];
};

export const useDummy = () => {
  console.log('dummy');
  return '';
};
