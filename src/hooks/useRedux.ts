import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for permission checking with debugging
export const usePermissions = () => {
  const { permissions, user } = useAppSelector(state => state.auth);
  
  const hasPermission = (permission: string) => {
    const result = permissions.includes(permission as any);
    console.log(`🔍 Permission check: ${permission} for ${user?.role} = ${result}`);
    return result;
  };
  
  return { permissions, hasPermission };
};