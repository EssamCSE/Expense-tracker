import { View, Text } from 'react-native'
import React from 'react'
import { HeaderProps } from '@/types'

const Header = ({title, leftIcon, className}:HeaderProps) => {
  return (
    <View className='flex flex-row justify-center items-center mt-4'>
      <Text className={`text-white font-bold text-xl ${className}`}>{title}</Text>
    </View>
  )
}

export default Header