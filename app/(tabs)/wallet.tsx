import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Wallet = () => {
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <Text className='text-white font-bold' >Wallet</Text>

    </SafeAreaView>
  )
}

export default Wallet