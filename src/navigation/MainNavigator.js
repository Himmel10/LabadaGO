import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerHome from '../screens/customer/CustomerHome';
import ShopHome from '../screens/shop/ShopHome';
import RiderHome from '../screens/rider/RiderHome';
import AdminHome from '../screens/admin/AdminHome';
import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();
  // Placeholder: role-based navigation logic needed
  return (
    <Tab.Navigator>
      <Tab.Screen name="Customer" component={CustomerHome} />
      <Tab.Screen name="Shop" component={ShopHome} />
      <Tab.Screen name="Rider" component={RiderHome} />
      <Tab.Screen name="Admin" component={AdminHome} />
    </Tab.Navigator>
  );
}
