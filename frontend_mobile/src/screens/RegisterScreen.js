import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, useWindowDimensions, Modal, Pressable, SafeAreaView, KeyboardAvoidingView, Alert} from 'react-native';

import CustomInput from '../components/CustomInput'
import CustomButton from '../components/CustomButton'
import { TextInput } from 'react-native-paper';
import { useFonts } from 'expo-font';

import { SoapRegular } from '../../assets/fonts/expo-fonts';

const RegisterScreen = ({navigation}) => {
    
    const {height} = useWindowDimensions();

     // genereated code and code entered by user
    const [verCode, setVerCode] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [validCode, setValidCode] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isPassCompFormSlid, setIsPassCompFormSlid] = useState(false);

    const view = require('../../assets/view.png')
    const hide = require('../../assets/hide.png')
    const [passwordVisibility, setPasswordVisibility] = useState(true)
    
    const app_name = 'ssu-testing'        // testing server
    
    const buildPath = (route) =>
    {
        return 'https://' + app_name + '.herokuapp.com' + route;
    }
    
    // checking for password complexity 
    // 1 lowercase, 1 uppercase, 1 special, 1 num, length >= 8
    function isPasswordValidFunc(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        let flag = regex.test(password);
        setIsPasswordValid(flag);
        return flag;
    }
    //Toggle password visibility
    const toggleShowPassword = () => {
        setPasswordVisibility(!passwordVisibility)
    };
    
    const onConfirmPressed = () => {
        console.log("registered");
    }
    
    const onSignInPressed = () => {
        navigation.navigate('Login')

    }
    const handleRegister = async () => {
        // checks for valid password complexity first
        if (!isPasswordValidFunc(password))
        {
            setIsPassCompFormSlid(true);
            console.warn("invalid password")
            return;
        }
        else
        {
            setIsPassCompFormSlid(false);
            const response = await fetch(buildPath('/api/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password })
            });
            const data = await response.json();
            // prints to console for now (inspect element to see console)
            if (data.error === '') 
            {
                Alert.alert(
                    "Registration Successful",
                    "You have successfully registered!",
                    [{ text: "OK", onPress: () => console.log("OK Pressed") }]
                );
                navigation.navigate('Login')
            } 
            else 
            {
                Alert.alert(
                    "Email Taken",
                    "It seems a user with this email already exists.",
                    [{ text: "OK", onPress: () => console.log("OK Pressed") }]
                );

                console.log(data.error);
            }
        }
    }

    const handleEmailVer = async() => {
        // first check for password complexity
        if (!firstName || !lastName)
        {
            Alert.alert(
                "Empty Fields",
                "Make sure all fields are filled out.",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }]
            );
            return
        }
        if (!isPasswordValidFunc(password))
        {
            Alert.alert(
                "Password does not meet requirements",
                "Make sure it's at least 8 characters including a number, 1 uppercase and 1 lowercase letter, and a special character.",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }]
            );
            console.log("invalid password")

            return;
        }
        else 
        {
            // password is valid, check if email is valid
            const response = await fetch(buildPath('/api/emailVer'), {
                method: 'POST',
                headers : { 'Content-Type': 'application/json' },
                body: JSON.stringify({email})
            });
            const data = await response.json();
            
            // found email, store the verification code
            if (data.error == '')
            {
                setEnteredCode('')
                setVerCode(data.code);
                setModalVisible(true);
                console.log(data.code)
            }
            // didnt find valid email address
            else
            {
                // email is invalid, display Invalid Alert
                Alert.alert(
                    "Invalid Email",
                    "Make sure you entered a valid email.",
                    [{ text: "OK", onPress: () => console.log("OK Pressed") }]
                );
                console.log(data.error);
            }
        }
    }

    // check for a valid verification code 
    const handleSubmitCode = () => 
    {
        // checks for entered code to match generated code
        if (enteredCode == verCode) {
            // true so call register api and hide form for code input
            handleRegister();
            setModalVisible(false);
        } 
        else 
        {
            // entered code is wrong
            Alert.alert(
                "Invalid Code",
                "Make sure entered the reset code correctly.",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }]
            );
            console.log('Invalid code, try again');
        }
    }

    const [modalVisible, setModalVisible] = useState(false);
    
    const [fontsloaded, setFontsLoaded] = useState(false);

    const [fontsLoaded] = useFonts({
        SoapRegular,
      });
    
      if (!fontsLoaded) {
        return null;
      }
        return (
        <SafeAreaView style={styles.root}>
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
                
            <Text style={styles.title}>Create an Account</Text>
                {/* <View style={{width: '100%', marginTop: 50, padding: 10}}> */}
                <KeyboardAvoidingView 
            behavior="padding"
            style={{ width: '100%', padding: 10, marginTop: 50 }}
            keyboardVerticalOffset={64} // adjust this value as needed
        >
                    <TextInput 
                        style={styles.input} 
                        mode="outlined" 
                        label="First Name" 
                        value={firstName} 
                        onChangeText={firstName => setFirstName(firstName)}
                    />
                    <TextInput 
                        style={styles.input} 
                        mode="outlined" 
                        label="Last Name" 
                        value={lastName} 
                        onChangeText={lastName => setLastName(lastName)}
                    />
                    <TextInput 
                        style={styles.input} 
                        mode="outlined" 
                        label="Email" 
                        value={email} 
                        onChangeText={email => setEmail(email)}
                        autoCapitalize="none"
                    />

                    <View>
                    <TextInput 
                        style={styles.input} 
                        mode="outlined" 
                        label="Password" 
                        value={password} 
                        onChangeText={password => setPassword(password)} 
                        secureTextEntry={passwordVisibility}
                        autoCapitalize="none"
                        
                    />
                        <Pressable
                        activeOpacity={0.8}
                        style={styles.visibilityBtn}
                        onPress={toggleShowPassword}>
                        <Image
                            source={
                            passwordVisibility
                                ? view
                                : hide
                            }
                            style={{height: 25, width: 25, }}
                        />
                        </Pressable>
                    </View>
                    {/* </View> */}
                    </KeyboardAvoidingView> 
                    </View>
                <View style={{width: '100%', padding: 10}}>
                    <CustomButton text="Register" onPress={handleEmailVer}/>
                    <CustomButton text="Already have an account? Sign In" onPress={onSignInPressed} type="TERTIARY"/>
                </View>

            <Modal animationType="slide" transparent={false} visible={modalVisible}>
                <View style={styles.root}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Confirm your email</Text>
                    <View style={{width: '100%', marginTop: 20}}>
                        <CustomInput placeholder="Activation Code" value={enteredCode} setValue={setEnteredCode} />
                    </View>
                    <View style={{width: '100%', marginVertical: 100}}>
                        <CustomButton text="Confirm" onPress={handleSubmitCode}/>
                        <CustomButton text="Cancel" onPress={() => setModalVisible(!modalVisible)} type="TERTIARY"/>
                    </View>
                </View>
                </View>
            </Modal>
            
        </SafeAreaView>
        );
   
}

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f0e9b2',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    modalContainer: {
        width:'100%', 
        padding: 10, 
        alignItems: 'center', 
        marginVertical: 20

    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'SoapRegular',
        marginVertical: 10,
        marginTop: 50,
        color: '#343434'
    },
    container: {
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    visibilityBtn: {
        position: 'absolute',
        right: 10,
        height: 25,
        width: 25,
        padding: 0,
        marginTop: 23,
    },
    input: {
        marginVertical: 5, 
        backgroundColor: '#f7fff7'
    }
      
});


export default RegisterScreen;