# Supabase Configuration Guide

This guide will help you set up Supabase for the LabadaGO application.

## 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up
3. Create a new organization and project

## 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under `API URL`)
   - **Project API Key** (under `anon public`)

## 3. Set Up Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Database Schema Setup

Create the required tables in your Supabase dashboard. Here's a basic schema:

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('customer', 'rider', 'shop_owner', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  shop_id UUID NOT NULL REFERENCES public.users(id),
  rider_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'booking_created',
  total_amount DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Shops Table
```sql
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Authentication Rules

Configure Row Level Security (RLS) in Supabase for security:

1. Enable RLS on all tables
2. Add policies to restrict access based on user roles

Example policy for users table:
```sql
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

## 6. Usage in Your App

### Using the Supabase Context
```tsx
import { useSupabase } from '@/contexts/SupabaseContext';

export default function MyComponent() {
  const { user, session } = useSupabase();
  
  return (
    <View>
      <Text>Welcome {user?.email}</Text>
    </View>
  );
}
```

### Querying Data
```tsx
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('customer_id', userId);

// Insert data
const { data, error } = await supabase
  .from('orders')
  .insert({ customer_id: userId, status: 'booking_created' });

// Update data
const { error } = await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('id', orderId);
```

## 7. Wrap Your App with SupabaseProvider

Update your root layout to include the SupabaseProvider:

```tsx
import { SupabaseProvider } from '@/contexts/SupabaseContext';

export default function RootLayout() {
  return (
    <SupabaseProvider>
      {/* Your app content */}
    </SupabaseProvider>
  );
}
```

## Troubleshooting

### "Supabase credentials not configured"
- Check your `.env.local` file
- Ensure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the development server after adding env variables

### Authentication issues
- Verify email confirmation is enabled in Supabase Auth settings
- Check user roles and RLS policies

### Data not loading
- Enable RLS policies for your tables
- Check user permissions for the tables
- Verify foreign key relationships
