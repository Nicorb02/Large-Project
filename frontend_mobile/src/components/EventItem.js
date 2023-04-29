import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Card } from "react-native-paper";

const EventItem = ({ title, isHoliday, startTime, onPress }) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    // const time = startTime.toLocaleTimeString([], options);

    if (isHoliday)
    {
        return(
            <TouchableOpacity 
            style={{marginRight: 10, marginTop: 10}}>
                    <Card style={{backgroundColor:'#F0E9B2', borderRadius: 0}}>
                        <Card.Content>    
                            <View>
                                <Text>
                                    {title}
                                </Text>
                                <Text>
                                    {startTime}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                </TouchableOpacity>
        )
    }

    return(
        <TouchableOpacity 
        style={{marginRight: 10, marginTop: 10}}
        onPress={() => {
            if (typeof onPress === 'function') onPress();
        }}
        >
                <Card style={{backgroundColor:'#fff', borderRadius: 0}}>
                    <Card.Content>    
                        <View>
                            <Text>
                                {title}
                            </Text>
                            <Text>
                                {startTime}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
    )
}

export default EventItem;