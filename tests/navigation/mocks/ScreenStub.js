import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ScreenStub({ navigation, route }) {
  return (
    <View>
      <Text>{`ROUTE:${route?.name ?? 'unknown'}`}</Text>
      <Pressable onPress={() => navigation.navigate('MyMaterials')}>
        <Text>OPEN_PROTECTED</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Admin')}>
        <Text>OPEN_ADMIN</Text>
      </Pressable>
    </View>
  );
}
