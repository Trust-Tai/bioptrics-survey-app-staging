import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Map the theme properties used in components to the actual theme structure
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    errorColor: string;
    sidebarColor?: string;
    sidebarText?: string;
  }
}
