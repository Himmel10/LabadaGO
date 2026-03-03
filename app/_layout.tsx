import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ShopProvider } from "@/contexts/ShopContext";
import { MessageProvider } from "@/contexts/MessageContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerTintColor: Colors.primary,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="customer" options={{ headerShown: false }} />
      <Stack.Screen name="shop-owner" options={{ headerShown: false }} />
      <Stack.Screen name="rider" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen
        name="shop-detail"
        options={{ title: "Shop Details", headerShown: true }}
      />
      <Stack.Screen
        name="book-laundry"
        options={{ title: "Book Laundry", headerShown: true }}
      />
      <Stack.Screen
        name="order-detail"
        options={{ title: "Order Details", headerShown: true }}
      />
      <Stack.Screen
        name="task-detail"
        options={{ title: "Task Details", headerShown: true }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OrderProvider>
            <ShopProvider>
              <MessageProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </MessageProvider>
            </ShopProvider>
          </OrderProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}
