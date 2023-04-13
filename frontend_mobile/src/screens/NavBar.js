import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Dimensions, Image, StyleSheet } from 'react-native';

import ScheduleScreen from "./ScheduleScreen";
import NotesScreen from "./NotesScreen";
import ProfileScreen from "./ProfileScreen";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const Tab = createBottomTabNavigator();

const NavBar = ({ navigation }) => {
    return (
        <Tab.Navigator 
        screenOptions={{
          header: () => null,
          tabBarShowLabel: false, 
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: '#fff',
            borderRadius: 10,
            height: 90, 
            paddingBottom: 15
          }
        }}
      >
        <Tab.Screen name='Home Screen' 
          component={ScheduleScreen} 
          options={{ 
            tabBarIcon: ({focused}) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Image  source={require('../../assets/home.png')} 
                  resizeMode='contain'
                  style={[
                    styles.image, {tintColor: focused ? '#e94d0b' : '#343434'}
                ]} 
                />
                <Text style={{color: focused ? '#e94d0b' : '#fff', fontSize: 12}}>Home</Text>
              </View>
            ),
          }}
        />
        
        <Tab.Screen name='Notes' 
          component={NotesScreen} 
          options={{
            tabBarIcon: ({focused}) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Image  source={require('../../assets/notes.png')} 
                  resizeMode='contain'
                  style={[
                    styles.image, {tintColor: focused ? '#e94d0b' : '#343434'}
                ]} 
                />
                <Text style={{color: focused ? '#e94d0b' : '#fff', fontSize: 12}}>Notes</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen  
          name='Profile' 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({focused}) => (
              <View style={{alignItems: 'center', justifyContent: 'center',}}>
                  <Image  source={require('../../assets/profile.png')} 
                  resizeMode='contain'
                  style={[
                      styles.image, {tintColor: focused ? '#e94d0b' : '#343434'}
                  ]} 
                  />
                <Text style={{color: focused ? '#e94d0b' : '#fff', fontSize: 12}}>Profile</Text>
              </View>
            ),
          }}
        />
         <Tab.Screen name='To do' 
          component={NotesScreen} 
          options={{
            tabBarIcon: ({focused}) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                 <Image  source={require('../../assets/todo.png')} 
                  resizeMode='contain'
                  style={[
                    styles.image, {tintColor: focused ? '#e94d0b' : '#343434'}
                ]} 
                />
                <Text style={{color: focused ? '#e94d0b' : '#fff', fontSize: 12}}>To Do</Text>
              </View>
            ),
          }}
        />
         <Tab.Screen name='Contacts' 
          component={NotesScreen} 
          options={{
            tabBarIcon: ({focused}) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Image  source={require('../../assets/contacts.png')} 
                  resizeMode='contain'
                  style={[
                    styles.image, {tintColor: focused ? '#e94d0b' : '#343434'}
                ]} 
                />
                <Text style={{color: focused ? '#e94d0b' : '#fff', fontSize: 12}}>Contacts</Text>
              </View>
            ),
          }}
        />
        
      </Tab.Navigator>


    )
}

const styles = StyleSheet.create({
  image: {
    width: 35,
    height: 35,
    margin: 5,
    
  }
  
})

export default NavBar;