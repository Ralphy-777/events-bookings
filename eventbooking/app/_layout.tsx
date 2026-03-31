import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="book" options={{ title: 'Create Booking', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#0ea5e9' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="payment" options={{ title: 'Payment', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#0ea5e9' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="organizer" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
