import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole } from '@/types';

const AUTH_KEY = 'labadago_auth';
const USERS_KEY = 'labadago_users';
const PASSWORDS_KEY = 'labadago_passwords';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [storedAuth, storedUsers, storedPasswords] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(USERS_KEY),
        AsyncStorage.getItem(PASSWORDS_KEY),
      ]);

      let allUsersData: User[] = [];
      let passwordsData: Record<string, string> = {};

      if (storedUsers) {
        allUsersData = JSON.parse(storedUsers);
      }
      if (storedPasswords) {
        passwordsData = JSON.parse(storedPasswords);
      }
      
      // Initialize admin user if it doesn't exist
      const adminExists = allUsersData.some((u) => u.email === 'admin@labadago.com');
      if (!adminExists) {
        const adminUser: User = {
          id: 'admin_default',
          name: 'Administrator',
          email: 'admin@labadago.com',
          phone: '0901234567',
          role: 'admin',
          wallet: 0,
          createdAt: new Date().toISOString(),
        };
        allUsersData = [...allUsersData, adminUser];
        passwordsData = { ...passwordsData, 'admin_default': 'admin123' };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(allUsersData));
        await AsyncStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwordsData));
        console.log('Initialized default admin account');
      }

      setAllUsers(allUsersData);
      setPasswords(passwordsData);

      if (storedAuth) {
        const authUser = JSON.parse(storedAuth);
        const freshUser = allUsersData.find((u) => u.id === authUser.id);
        setUser(freshUser ?? authUser);
      }
    } catch (e) {
      console.log('Failed to load auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = useCallback(async (users: User[]) => {
    setAllUsers(users);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, []);

  const savePasswords = useCallback(async (pwds: Record<string, string>) => {
    setPasswords(pwds);
    await AsyncStorage.setItem(PASSWORDS_KEY, JSON.stringify(pwds));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      console.log('Login failed: user not found for email:', email);
      return null;
    }
    const storedPassword = passwords[found.id];
    if (storedPassword && storedPassword !== password) {
      console.log('Login failed: incorrect password for:', email);
      return null;
    }
    setUser(found);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(found));
    console.log('Login successful for:', found.name, 'role:', found.role);
    return found;
  }, [allUsers, passwords]);

  const registerCustomer = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }): Promise<User> => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      role: 'customer',
      wallet: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...allUsers, newUser];
    const updatedPasswords = { ...passwords, [newUser.id]: data.password };

    await saveUsers(updatedUsers);
    await savePasswords(updatedPasswords);
    setUser(newUser);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    console.log('Registered customer:', newUser.name);
    return newUser;
  }, [allUsers, passwords, saveUsers, savePasswords]);

  const registerShopOwner = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    shopName: string;
    shopAddress: string;
    shopDescription: string;
    password: string;
  }): Promise<User> => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'shop_owner',
      shopName: data.shopName,
      shopAddress: data.shopAddress,
      shopDescription: data.shopDescription,
      wallet: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...allUsers, newUser];
    const updatedPasswords = { ...passwords, [newUser.id]: data.password };

    await saveUsers(updatedUsers);
    await savePasswords(updatedPasswords);
    setUser(newUser);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    console.log('Registered shop owner:', newUser.name, 'shop:', data.shopName);
    return newUser;
  }, [allUsers, passwords, saveUsers, savePasswords]);

  const registerRider = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    vehicleType: 'motorcycle' | 'bicycle' | 'car';
    plateNumber?: string;
    assignedShopId?: string;
    assignedShopName?: string;
    driverLicense?: string;
    validId?: string;
  }): Promise<User> => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      role: 'rider',
      isAvailable: false,
      vehicleType: data.vehicleType,
      plateNumber: data.plateNumber,
      assignedShopId: data.assignedShopId,
      assignedShopName: data.assignedShopName,
      driverLicense: data.driverLicense,
      validId: data.validId,
      wallet: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...allUsers, newUser];
    const updatedPasswords = { ...passwords, [newUser.id]: data.password };

    await saveUsers(updatedUsers);
    await savePasswords(updatedPasswords);
    console.log('Registered rider:', newUser.name, 'assigned to shop:', data.assignedShopName);
    return newUser;
  }, [allUsers, passwords, saveUsers, savePasswords]);

  const suspendUser = useCallback(async (userId: string) => {
    const updatedUsers = allUsers.map((u) =>
      u.id === userId ? { ...u, isSuspended: true } : u
    );
    await saveUsers(updatedUsers);
    console.log('Suspended user:', userId);
  }, [allUsers, saveUsers]);

  const activateUser = useCallback(async (userId: string) => {
    const updatedUsers = allUsers.map((u) =>
      u.id === userId ? { ...u, isSuspended: false, isAvailable: u.role === 'rider' ? true : u.isAvailable } : u
    );
    await saveUsers(updatedUsers);
    console.log('Activated user:', userId);
  }, [allUsers, saveUsers]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    const updatedUsers = allUsers.map((u) => u.id === updated.id ? updated : u);
    await saveUsers(updatedUsers);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    console.log('Updated user:', updated.name);
  }, [user, allUsers, saveUsers]);

  const addToWallet = useCallback(async (userId: string, amount: number) => {
    const updatedUsers = allUsers.map((u) => {
      if (u.id === userId) {
        return { ...u, wallet: (u.wallet ?? 0) + amount };
      }
      return u;
    });
    await saveUsers(updatedUsers);
    if (user && user.id === userId) {
      const updatedUser = { ...user, wallet: (user.wallet ?? 0) + amount };
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    }
    console.log('Added to wallet:', userId, '+₱' + amount);
  }, [user, allUsers, saveUsers]);

  const logout = useCallback(async () => {
    console.log('Logging out user:', user?.name);
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, [user]);

  const getAvailableRiders = useCallback(() => {
    return allUsers.filter((u) => u.role === 'rider' && u.isAvailable !== false);
  }, [allUsers]);

  const getUsersByRole = useCallback((role: UserRole) => {
    return allUsers.filter((u) => u.role === role);
  }, [allUsers]);

  return {
    user,
    allUsers,
    isLoading,
    login,
    registerCustomer,
    registerShopOwner,
    registerRider,
    updateUser,
    addToWallet,
    logout,
    getAvailableRiders,
    getUsersByRole,
    suspendUser,
    activateUser,
  };
});
