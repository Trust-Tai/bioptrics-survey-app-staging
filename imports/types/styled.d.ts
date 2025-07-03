import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    sidebarColor: string;
    sidebarTextColor: string;
    errorColor: string;
    sidebarColor?: string;
    sidebarText?: string;
  }
}
