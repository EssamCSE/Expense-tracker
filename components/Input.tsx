import { View, Text, TextInput, Image } from 'react-native'
import React from 'react'
import { InputProps } from '@/types'

const Input = ({className, placeholder, inputRef, icon, ...props}: InputProps) => {
  return (
    <View className={`flex flex-row h-12 items-center px-4 bg-neutral-800 border border-neutral-700 rounded-xl space-x-3 mt-4 ${className}`}>
        {icon && icon}
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          className="flex-1 text-white text-base font-normal"
          {...props}
        />
    </View>
  )
}

export default Input