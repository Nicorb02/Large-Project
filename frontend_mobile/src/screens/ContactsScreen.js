import React, { useState, useEffect } from "react";
import { Card, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import Icon from "react-native-vector-icons/Feather"
import { Swipeable } from "react-native-gesture-handler";

import { TextInput } from "react-native-paper";
import { SoapRegular } from '../../assets/fonts/expo-fonts'
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ContactsScreen = () => {
    
    const [contacts, setContacts] = useState([])

    const [firstTimeInvoke, setFirstTimeInvoke] = useState(true)
    
    const [contactName, setContactName] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')

    const [contactNameError, setContactNameError] = useState(false)
    const [contactPhoneError, setContactPhoneError] = useState(false)
    const [contactEmailError, setContactEmailError] = useState(false)
    const [inputValid, setInputValid] = useState(false)
    
    const [editItem, setEditItem] = useState({_id: null});
    
    const [addContactModal, setAddContactModal] = useState(false)
    const [editContactModal, setEditContactModal] = useState(false)

    const [submitEnabled, setSubmitEnabled] = useState(false)


    const [errorText, setErrorText] = useState('')

    const fillAllError = "Please fill all fields."
    const phoneError = "Please enter a valid phone number."
    const emailError = "Please enter a valid email."


    const storage = require('../tokenStorage.js');

    // retrieve user data and current jwt from local storage
    const getUserDataAndToken = async () => {
      const userDataString = await AsyncStorage.getItem('user_data');
      const userData = JSON.parse(userDataString);
      const jwtToken = await storage.retrieveToken();
      
      return { userData, jwtToken };
    }

    const app_name = 'ssu-testing'        // testing server

    const buildPath = (route) =>
    {
        return 'https://' + app_name + '.herokuapp.com' + route;
    }

    

    const displayContacts = () => {
        if (contacts.length == 0)
            return(
                <View style={{alignItems: "center", justifyContent: "center", marginTop: 300}}>
                    <Text>You have no contacts</Text>
                </View>
            )
        else
            return(
                <FlatList data={contacts} renderItem={renderItems} keyExtractor={(contact) => contact._id} />
            )
    }

    const clearInput = () => {
        setContactName('')
        setContactEmail('')
        setContactPhone('')
    }

    const refreshInputValidity = () => {
        checkNameValidity(contactName)
        checkPhoneValidity(contactPhone)
        checkEmailValidity(contactEmail)
    }

    const getColorFromPhoneNumber = (phoneNumber) => {
        const colors = ['#e94d0b', '#ff9900', '#ffe66d', '#f0e9b2', '#343434'];
        const hash = phoneNumber.split('').reduce((hash, char) => {
            hash = ((hash << 5) - hash) + char.charCodeAt(0);
            return hash & hash;
        }, 0);
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    const checkInputValidity = () => {


        console.log(contactNameError)
        console.log(contactPhoneError)
        console.log(contactEmailError)
        if (!contactNameError && !contactPhoneError && !contactEmailError)
        {
            setInputValid(true)
            setErrorText('')
        }
        else
        {
            
            setInputValid(false)

            if (contactNameError) 
            {
                setErrorText(fillAllError)
                return
            }
            else if (contactPhoneError)    
            {
                setErrorText(phoneError)
                return
            }
            else if (contactEmailError)
            {
                setErrorText(emailError)
            }
        }
    }
    
    const determineSubmitEnabled = () => {
        const allInputsValid = isNameValid(contactName) && isEmailValid(contactEmail) && isPhoneValid(contactPhone);
        setSubmitEnabled(allInputsValid)
    }

    const renderItems = ({ item }) => (
        <Swipeable
    renderRightActions={() => (
    <TouchableOpacity
    style={styles.deleteButton}
    onPress={() => deleteContact(item._id)}
    >
    <Icon name="trash-2" size={30} color="#fff"/>
    </TouchableOpacity>
    )}
>
        <TouchableOpacity onPress={() => {
            openEditModal(item)
        }}>
            <Card style={{margin: 10, backgroundColor: '#f7fff7', borderRadius: 0}}>
                <View style={{flexDirection: 'row', alignItems:'center', padding: 10}}>
                    <Avatar.Text label={item.name[0]} size={60} style={{backgroundColor: getColorFromPhoneNumber(item._id)}}/>
                    <View style={{marginLeft: 20}}>
                        <View style={{flexDirection: "row"}}>
                            <Icon name="user" size={20} color="#343434"/>
                            <Text style={[styles.item, {fontWeight:"bold"}]}>{item.name}</Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <Icon name="phone" size={20} color="#343434"/>
                            <Text style={styles.item}>({item.phone.slice(0, 3)})-{item.phone.slice(3, 6)}-{item.phone.slice(6, 10)}</Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <Icon name="mail" size={20} color="#343434"/>
                            <Text style={styles.item}>{item.email}</Text>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
        </Swipeable>
    );

    const loadItemsFromServer = async () => {
        const { userData, jwtToken } = await getUserDataAndToken();
        const response = await fetch(buildPath('/api/searchContact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ _id: userData.id, name: '' })
        });

        const data = await response.json();

        if (data.error === '')
        {
            console.log('load success')
            setContacts(data.results)
        }
        else
        {
            console.log('load fail')
        }
    }

    const deleteContact = async (itemId) => {
        const { userData, jwtToken } = await getUserDataAndToken();
        const response = await fetch(buildPath('/api/deleteContact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ _id: userData.id, itemId })
        });

        const data = await response.json();
        if (data.error === '')
        {
            console.log('delete successful')
            loadItemsFromServer()
        }
        else
        {
            console.log('delete failed')
        }
    };

    const addContact = async () => {
        const { userData, jwtToken } = await getUserDataAndToken();
        const response = await fetch(buildPath('/api/addContact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ _id: userData.id, name: contactName, email: contactEmail, phone: contactPhone })
        });

        const data = await response.json();
        if (data.error === '')
        {
            console.log('add successful')
            loadItemsFromServer()
            setAddContactModal(false)   
        }
        else
        {
            console.log('add failed')
        }
    }
    const editContact = async () => {
        const { userData, jwtToken } = await getUserDataAndToken();
        const response = await fetch(buildPath('/api/editContact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ _id: userData.id, itemId: editItem._id, name: contactName, email: contactEmail, phone: contactPhone, jwtToken })
        });

        const data = await response.json();
        if (data.error === '')
        {
            console.log('edit successful')
            loadItemsFromServer()
            setEditContactModal(false)  
        }
        else
        {
            console.log('edit failed')
        }
    };  

    const checkPhoneValidity = (contactPhone) => {
        if (!isPhoneValid(contactPhone))
            setContactPhoneError(true)
        else
            setContactPhoneError(false)
    }

    const checkNameValidity = (contactName) => {
        if (!isNameValid(contactName))
            setContactNameError(true)
        else
            setContactNameError(false)
    }

    const checkEmailValidity = (contactEmail) => {
        if (!isEmailValid(contactEmail))
            setContactEmailError(true)
        else
            setContactEmailError(false)
    }

    const isNameValid = (contactName) => {
        return !!contactName
    }

    const isPhoneValid = (contactPhone) => {
        return contactPhone.length === 10
    }
    
    const isEmailValid = (contactEmail) => {
        return (!!contactEmail && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)))
    }
    
    const openEditModal = (item) => {
        setEditItem(item);
        setContactName(item.name)
        setContactEmail(item.email)
        setContactPhone(item.phone)
        setErrorText('')
        setEditContactModal(true)
    }

    const openAddModal = () => {
        setAddContactModal(true)
    }

    useEffect(() => {
        determineSubmitEnabled()

        if (firstTimeInvoke)
            setFirstTimeInvoke(false)
        else
            refreshInputValidity()

      }, [contactName, contactPhone, contactEmail, editItem.id])

      // reset everything when modals are closed
      useEffect(() => {
        if (!editContactModal && !addContactModal)
        {
            setFirstTimeInvoke(true)
            setContactNameError(false)
            setContactEmailError(false)
            setContactPhoneError(false)
            clearInput()
            setErrorText('')
            setSubmitEnabled(false)
        }
      }, [editContactModal, addContactModal])

      useEffect(() => {
          checkInputValidity()
      }, [contactEmailError, contactNameError, contactPhoneError])

      useEffect(() => {
        loadItemsFromServer()
      }, [])

    const [fontsLoaded] = useFonts({
        SoapRegular,
    });
    
    if (!fontsLoaded) {
    return null;
    }
    return(
        <SafeAreaView style={styles.container}>

            <View style={{flexDirection:"row", justifyContent:'space-between', alignItems: "center", marginRight: 25}}>
                <Text style={styles.title}>Contacts</Text>
                <View>
                    <TouchableOpacity onPress={() => {
                        openAddModal()
                    }}>
                    <Icon name="plus" size={45} color='#e94d0b'/>

                    </TouchableOpacity>
            </View>
            </View>

            {
                displayContacts()
            }
            
            


            <Modal animationType="slide" visible={addContactModal}>
                <View style={styles.root}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Add Contact</Text>
                        <Avatar.Text label={contactName ? contactName[0].toUpperCase() : null} size={100} style={{backgroundColor:'#ff9900'}}/>
                        <View style={{width: '100%', marginTop: 20}}>
                            <TextInput style={styles.input} mode="outlined" label="Name" value={contactName} onChangeText={contactName => setContactName(contactName)} autoCapitalize="none" error={contactNameError}/>
                            <TextInput style={styles.input} mode="outlined" label="Phone" value={contactPhone} onChangeText={contactPhone => setContactPhone(contactPhone)} autoCapitalize="none" error={contactPhoneError}/>
                            <TextInput style={styles.input} mode="outlined" label="Email" value={contactEmail} onChangeText={contactEmail => setContactEmail(contactEmail)} autoCapitalize="none" error={contactEmailError}/>
                        </View>
                        <View style={{marginTop: 30, justifyContent: "center", alignItems: 'center', backgroundColor: '#fff', width: 300}}>
                            <Text style={{color: 'red'}}>{errorText}</Text>
                        </View>
                    </View>
                    <View style={styles.buttons}>
                        <CustomButton text="Add Contact" disabled={!submitEnabled} onPress={() => {
                                addContact() 
                        }}/>
                        <CustomButton text="Cancel" onPress={() =>{
                            setAddContactModal(false)
                        }} type="TERTIARY"/>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide" visible={editContactModal}>
                <View style={styles.root}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Edit Contact</Text>
                        <Avatar.Text label={contactName ? contactName[0].toUpperCase() : null} size={100} style={{backgroundColor:'#ff9900'}}/>
                        <View style={{width: '100%', marginTop: 20}}>
                            <TextInput style={styles.input} mode="outlined" label="Name" value={contactName} onChangeText={(contactName) => {
                                setContactName(contactName)
                                
                            }} 
                            autoCapitalize="none" error={contactNameError}/>
                            <TextInput style={styles.input} mode="outlined" label="Phone" value={contactPhone} onChangeText={(contactPhone) => {
                                setContactPhone(contactPhone)
                                
                            }}
                            autoCapitalize="none" error={contactPhoneError}/>
                            <TextInput style={styles.input} mode="outlined" label="Email" value={contactEmail} onChangeText={(contactEmail) => {
                                setContactEmail(contactEmail)
                                
                            }} 
                            autoCapitalize="none" error={contactEmailError}/>
                        </View>
                        <View style={{marginTop: 30, justifyContent: "center", alignItems: 'center', backgroundColor: '#fff', width: 300}}>
                            <Text style={{color: 'red'}}>{errorText}</Text>
                        </View>
                    </View>
                    <View style={styles.buttons}>
                        <CustomButton text="Apply Changes" disabled={!submitEnabled} onPress={() => {
                            editContact()
                        }}/>
                            {/* <CustomButton text="Delete Contact" onPress={() =>{
                                deleteContact(editItem.id)
                            }} type="DELETE"/> */}
                        <CustomButton text="Cancel" onPress={() =>{
                            setEditContactModal(false)
                        }} type="TERTIARY"/>
                        {/* <View style={{marginTop: 100}}> */}
                        {/* </View> */}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
      marginBottom: 50,
      backgroundColor: '#fff'

    },
    item: {
        padding: 2,
        paddingLeft: 10,
        fontSize: 15,
    },
    root: {
        flexDirection: "column",
        justifyContent: "space-between",
        height: '100%'
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        margin: 15,
        color: '#343434',
        fontFamily: 'SoapRegular'
    },
    dateContainer: {
        flexDirection:'row', 
        justifyContent:"center",
        alignItems: "center", 
        width: '100%',
        padding: 10,

    },
    text: {
        fontSize: 16,

    },
    input: {
        marginVertical: 5, 
        backgroundColor: '#fff'
    },
    error: {
        color: 'red'
        
    },
    content: {
        alignItems: 'center',
        padding: 10,
        marginVertical: 50
    },
    buttons: {
        width: '100%', 
        bottom: 5, 
        padding: 10
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        width: 100,
      },
  });

export default ContactsScreen;
