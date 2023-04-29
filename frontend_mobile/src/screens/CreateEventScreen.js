import React,{useState} from "react";
import { View, Text, Modal, StyleSheet, SafeAreaView } from "react-native";
import DTPicker from "../components/DTPicker";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { TextInput } from "react-native-paper";


const CreateEventScreen = ({onPressAdd, onPressCancel}) => {

    const [eventStartDate, setEventStartDate] = useState(new Date())
    const [eventEndDate, setEventEndDate] = useState(new Date())
    const [eventTitle, setEventTitle] = useState('')


    const changeStartDate = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            console.log(
              'picker was dismissed',
              undefined,
              [
                {
                  text: 'great',
                },
              ],
              {cancelable: true},
            );
            return;
          }
      
          if (event.type === 'neutralButtonPressed') {
            setEventStartDate(new Date(0));
          } else {
            setEventStartDate(selectedDate);
          }
    }
    const changeEndDate = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            console.log(
              'picker was dismissed',
              undefined,
              [
                {
                  text: 'great',
                },
              ],
              {cancelable: true},
            );
            return;
          }
      
          if (event.type === 'neutralButtonPressed') {
            setEventEndDate(new Date(0));
          } else {
            setEventEndDate(selectedDate);
          }
    }

    return(
        <SafeAreaView style={styles.root}>
            <Text style={styles.title}>Create Event</Text>
            <View style={{width: '100%'}}>
            <View style={{width: '100%', marginTop: 20, padding: 10}}>
                <TextInput 
                    style={styles.input} 
                    mode="outlined" 
                    label="Event" 
                    value={eventTitle} 
                    onChangeText={eventTitle => setEventTitle(eventTitle)}
                    autoCapitalize="none"
                    />           
            <View style={{width: '100%', marginTop: 30}}>
                <View style={styles.dateContainer}>
                    <Text style={styles.text}>Start</Text>
                    <DTPicker value={eventStartDate} onChange={changeStartDate}/>
                </View>
              </View>
                </View>
                
            </View>
            <View style={{width: '100%', marginBottom: 0, padding: 10}}>
                <CustomButton text="Add Event" onPress={() => {
                    onPressAdd(eventTitle, eventStartDate, eventEndDate)
                    
                }}/>
                <CustomButton text="Cancel" onPress={() =>{

                    onPressCancel()
                }} type="TERTIARY"/>
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 10,
        marginVertical: 0,
        flexDirection: "column",
        justifyContent: "space-between",
        height: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        marginTop: 50,
        color: '#343434'
    },
    dateContainer: {
        flexDirection:'row', 
        justifyContent:"center",
        alignItems: "center", 
        width: '100%',
        padding: 30,

    },
    text: {
        fontSize: 16,

    },
    input: {
        marginVertical: 5, 
        backgroundColor: '#fff'
    }
})

export default CreateEventScreen;