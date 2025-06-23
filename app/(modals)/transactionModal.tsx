import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Import separated files

// Other imports
import BackButton from "@/components/BackButton";
import CustomAlertModal from "@/components/CustomAlertModal";
import CustomInput from "@/components/CustomInput";
import ImageUpload from "@/components/ImageUpload";
import { expenseCategories, transactionTypes } from "@/constants/data";
import { useAuth } from "@/context/authContext";
import { useTransactionAnimations } from "@/hooks/animation/useTransactionModalAnimation";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import UseFetchData from "@/hooks/useFetchData";
import {
  createOrUpdateTransaction,
  deleteTransaction,
} from "@/service/transactionService";
import { TransactionType, WalletType } from "@/types";
import { styles } from "@/utils/styles/transactionModalStyles";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Custom Input Component

const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // custom alert hook
  const { alertState, hideAlert, showError, showSuccess, showConfirmation } =
    useCustomAlert();

  // Use the custom animation hook
  const {
    containerAnimatedStyle,
    headerAnimatedStyle,
    cardAnimatedStyle,
    formAnimatedStyle,
    buttonAnimatedStyle,
    glowAnimatedStyle,
    particle1Style,
    particle2Style,
    particle3Style,
    animateButtonPress,
  } = useTransactionAnimations();

  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    category: "",
    date: new Date(),
    description: "",
    image: null,
    uid: user?.uid || "",
    walletId: "",
  });

  const params = useLocalSearchParams();
  const {
    id,
    type,
    amount,
    category,
    date,
    description,
    image,
    uid,
    walletId,
  } = params;

  // Wallet Data
  const { data: wallets = [] } = UseFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  useEffect(() => {
    if (id) {
      setTransaction((prev) => ({
        ...prev,
        type: (type as string) || prev.type,
        category: (category as string) || prev.category,
        date: date ? new Date(date as string) : prev.date,
        description: (description as string) || prev.description,
        image: (image as string) || prev.image,
        amount: amount ? Number(amount) : prev.amount,
        uid: (uid as string) || prev.uid,
        walletId: (walletId as string) || prev.walletId,
      }));
    }
  }, [id, type, amount, category, date, description, image, uid, walletId]);

  const onSubmit = async () => {
    animateButtonPress();

    if (!transaction.walletId) {
      showError("Validation Error", "Please select a wallet");
      return;
    }

    if (transaction.amount <= 0) {
      showError("Validation Error", "Please enter a valid amount");
      return;
    }

    if (transaction.type === "expense" && !transaction.category) {
      showError("Validation Error", "Please select a category for expense");
      return;
    }

    if (id) transaction.id = id as string;
    setLoading(true);
    try {
      const res = await createOrUpdateTransaction(transaction);
      if (res.success) {
        showSuccess("Success", "Transaction created successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        showError("Error", res.msg || "Transaction creation failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showError("Error", "Something went wrong. Please try again.");
    }
  };

  const onDelete = async () => {
    const res = await deleteTransaction(id as string);
    if (res.success) {
      setLoading(false);
      showSuccess("Deleted", "Transaction deleted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } else {
      showError("Error", "Failed to delete transaction");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    showConfirmation(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      async () => {
        setDeleteLoading(true);
        await onDelete();
      }
    );
  };

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: currentDate });
    setShowDatePicker(false);
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Background Effects */}
        <View style={styles.backgroundContainer}>
          <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
          <Animated.View
            style={[styles.particle, styles.particle1, particle1Style]}
          />
          <Animated.View
            style={[styles.particle, styles.particle2, particle2Style]}
          />
          <Animated.View
            style={[styles.particle, styles.particle3, particle3Style]}
          />
        </View>

        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <BackButton />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {id ? "Edit Transaction" : "Add Transaction"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {id ? "Update your transaction" : "Track your spending"}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.mainCard, cardAnimatedStyle]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Icons.Receipt size={24} color="#a3e635" weight="fill" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Transaction Details</Text>
                <Text style={styles.cardSubtitle}>
                  Fill in the information below
                </Text>
              </View>
            </View>

            {/* Form Fields */}
            <Animated.View style={formAnimatedStyle}>
              {/* Transaction Type Dropdown */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Transaction Type</Text>
                <View style={styles.dropdownContainer}>
                  <Icons.ArrowsLeftRight
                    size={16}
                    color="#a3e635"
                    weight="bold"
                    style={styles.dropdownIcon}
                  />
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.dropdownContainerStyle}
                    itemContainerStyle={styles.itemContainerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor="rgba(163, 230, 53, 0.1)"
                    data={transactionTypes}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select type"
                    value={transaction.type}
                    onChange={(item) => {
                      setTransaction({ ...transaction, type: item.value });
                    }}
                    renderRightIcon={() => (
                      <Icons.CaretDown size={16} color="#666" weight="bold" />
                    )}
                  />
                </View>
              </View>

              {/* Wallet Selection Dropdown */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Wallet</Text>
                <View style={styles.dropdownContainer}>
                  <Icons.Wallet
                    size={16}
                    color="#a3e635"
                    weight="bold"
                    style={styles.dropdownIcon}
                  />
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.dropdownContainerStyle}
                    itemContainerStyle={styles.itemContainerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor="rgba(163, 230, 53, 0.1)"
                    data={wallets.map((wallet) => ({
                      label: `${wallet?.name} (${wallet?.amount || 0})`,
                      value: wallet?.id,
                    }))}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Choose wallet"
                    value={transaction.walletId}
                    onChange={(item) => {
                      setTransaction({ ...transaction, walletId: item.value });
                    }}
                    renderRightIcon={() => (
                      <Icons.CaretDown size={16} color="#666" weight="bold" />
                    )}
                  />
                </View>
              </View>

              {/* Category Selection Dropdown */}
              {transaction.type === "expense" && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <View style={styles.dropdownContainer}>
                    <Icons.Tag
                      size={16}
                      color="#a3e635"
                      weight="bold"
                      style={styles.dropdownIcon}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      containerStyle={styles.dropdownContainerStyle}
                      itemContainerStyle={styles.itemContainerStyle}
                      itemTextStyle={styles.itemTextStyle}
                      activeColor="rgba(163, 230, 53, 0.1)"
                      data={Object.values(expenseCategories)}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Select category"
                      value={transaction.category}
                      onChange={(item) => {
                        setTransaction({
                          ...transaction,
                          category: item.value,
                        });
                      }}
                      renderRightIcon={() => (
                        <Icons.CaretDown size={16} color="#666" weight="bold" />
                      )}
                    />
                  </View>
                </View>
              )}

              {/* Amount */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Amount</Text>
                <CustomInput
                  value={transaction.amount?.toString()}
                  keyboardType="numeric"
                  onChangeText={(value: any) =>
                    setTransaction({
                      ...transaction,
                      amount: Number(value.replace(/[^0-9]/g, "")),
                    })
                  }
                  placeholder="Enter amount"
                  icon={
                    <Icons.CurrencyDollar
                      size={16}
                      color="#a3e635"
                      weight="bold"
                    />
                  }
                />
              </View>

              {/* Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date</Text>
                <AnimatedPressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icons.Calendar size={16} color="#a3e635" weight="bold" />
                  <Text style={styles.dateButtonText}>
                    {(transaction.date as Date).toLocaleDateString()}
                  </Text>
                  <Icons.CaretDown size={16} color="#666" weight="bold" />
                </AnimatedPressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={transaction.date as Date}
                    mode="date"
                    display="calendar"
                    onChange={onDateChange}
                  />
                )}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <CustomInput
                  value={transaction.description!}
                  multiline
                  onChangeText={(value: string) =>
                    setTransaction({ ...transaction, description: value })
                  }
                  placeholder="Add a note..."
                  icon={<Icons.Note size={16} color="#a3e635" weight="bold" />}
                />
              </View>

              {/* Receipt Upload */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Receipt</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <ImageUpload
                  file={transaction.image}
                  onSelect={(file) =>
                    setTransaction({ ...transaction, image: file })
                  }
                  onClear={() =>
                    setTransaction({ ...transaction, image: null })
                  }
                  placeholder="Upload receipt"
                />
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          {id ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Icons.CircleNotch size={20} color="white" />
                ) : (
                  <Icons.Trash size={20} color="#ef4444" weight="bold" />
                )}
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSubmit}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <Icons.CircleNotch size={20} color="white" />
                ) : (
                  <Icons.Check size={20} color="white" weight="bold" />
                )}
                <Text style={styles.submitButtonText}>
                  {loading ? "Updating..." : "Update"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
            onPress={onSubmit}
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <Icons.CircleNotch size={20} color="white" style={{ marginRight: 8 }} />
            ) : (
              <Icons.Plus size={20} color="white" weight="bold" style={{ marginRight: 8 }} />
              
            )}
            
          </TouchableOpacity>
          
          )}
        </Animated.View>
      </SafeAreaView>

      <CustomAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
        type={alertState.type}
        showIcon={alertState.showIcon}
      />
    </Animated.View>
  );
};

export default TransactionModal;
