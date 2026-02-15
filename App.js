import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import App from './src/App';
import { AuthProvider } from './src/hooks/useAuth';

function Main() {
	return (
		<AuthProvider>
			<App />
		</AuthProvider>
	);
}

registerRootComponent(Main);
