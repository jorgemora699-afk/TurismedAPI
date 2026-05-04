import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import QuestionnaireScreen from '../screens/Questionnaire/QuestionnaireScreen';
import PromotionsScreen from '../screens/Promotions/PromotionsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AdminScreen from '../screens/Admin/AdminScreen';
import PlaceDetailScreen from '../screens/Places/PlaceDetailScreen';
import SplashScreen from '../screens/Splash/SplashScreen'; // <-- importar

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminMain" component={AdminScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const MainTabs = ({ isAdmin }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#E85D04',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        height: 60,
        paddingBottom: 8,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Promotions') {
          iconName = focused ? 'pricetag' : 'pricetag-outline';
        } else if (route.name === 'Admin') {
          iconName = focused ? 'shield' : 'shield-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Inicio' }} />
    <Tab.Screen name="Promotions" component={PromotionsScreen} options={{ title: 'Promos' }} />
    {isAdmin && (
      <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'Admin' }} />
    )}
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false); // <-- estado del splash

  // Mientras auth carga, mostrar solo el splash (no duplicar loading)
  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E85D04" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs isAdmin={user?.role === 'admin'} /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;