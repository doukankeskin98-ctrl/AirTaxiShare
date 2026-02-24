import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import EmailAuthScreen from '../screens/EmailAuthScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import QueueScreen from '../screens/QueueScreen';
import MatchFoundScreen from '../screens/MatchFoundScreen';
import ChatScreen from '../screens/ChatScreen';
import MeetupConfirmScreen from '../screens/MeetupConfirmScreen';
import RatingScreen from '../screens/RatingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LegalScreen from '../screens/LegalScreen'; // Will implement next

export type RootStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    EmailAuth: undefined;
    ProfileSetup: undefined;
    Home: undefined;
    CreateMatch: undefined;
    Queue: { destination: string; time: string; luggage: string };
    MatchFound: { matchId: string; otherUser: any };
    Chat: { matchId: string; otherUser: any };
    MeetupConfirm: { matchId: string; otherUser?: any };
    Rating: { matchId: string; otherUser?: any };
    Settings: undefined;
    Legal: { type: 'tos' | 'privacy' };
};

const Stack = createStackNavigator<RootStackParamList>();

import { navigationRef } from './RootNavigation';

export default function AppNavigator() {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
                <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
                <Stack.Screen name="Queue" component={QueueScreen} />
                <Stack.Screen name="MatchFound" component={MatchFoundScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="MeetupConfirm" component={MeetupConfirmScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Legal" component={LegalScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
