import { ColorSchemeName } from '@/constants/theme';

// Always return 'light' theme regardless of system settings
export function useColorScheme(): ColorSchemeName {
  return 'light';
}
