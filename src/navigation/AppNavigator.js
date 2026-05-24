import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DeleteItemScreen from '../screens/DeleteItemScreen';
import AddItemScreen from '../screens/AddItemScreen';
import UpdateItemScreen from '../screens/UpdateItemScreen';
import GeoTagCamera from '../screens/GeoTagCamera';
import OCRFormScreen from '../screens/OCRFormScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ItemStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="DeleteItem" component={DeleteItemScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} />
      <Stack.Screen name="UpdateItem" component={UpdateItemScreen} />
      <Stack.Screen name="GeoTagCamera" component={GeoTagCamera} />
      <Stack.Screen name="OCRFormScreen" component={OCRFormScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Items') {
              iconName = 'inventory';
            } else if (route.name === 'Add') {
              iconName = 'add-circle';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            height: 60,
            paddingBottom: 10,
          },
          headerStyle: {
            backgroundColor: COLORS.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Items" 
          component={ItemStackNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Add" 
          component={AddItemScreen}
          options={{ title: 'Add New Item' }}
        />
         <Tab.Screen 
          name="GeoTagCamera" 
          component={GeoTagCamera}
          options={{ title: 'Geo Tag Camera' }}
        />
        <Tab.Screen 
          name="OCRFormScreen" 
          component={OCRFormScreen}
          options={{ title: 'OCR Form Screen' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;