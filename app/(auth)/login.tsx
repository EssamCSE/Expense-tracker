import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/BackButton'

const Login = () => {
  return (
    <SafeAreaView className='flex-1 bg-neutral-900'>
      {/* <Text className='text-white'>Login</Text> */}
      <BackButton/>
    </SafeAreaView>
  )
}

export default Login