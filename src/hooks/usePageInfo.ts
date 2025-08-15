// hooks/usePageInfo.ts
import { useEffect } from 'react';
import { useAppDispatch } from './useRedux'; 
import { setPageInfo } from '../store/slices/uiSlice'; // Import the new action

export const usePageInfo = (title: string, tagline: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageInfo({ title, tagline }));
  }, [dispatch, title, tagline]);
};