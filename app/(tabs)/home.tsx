import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { meApi } from "../../api/auth";
import { depositMoneyApi, getTransactionsApi, getUsersApi, transferMoneyApi } from "../../api/users";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

const formatBalance = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const MoneyLoader = ({ size = 24, color = "#007AFF" }: { size?: number; color?: string }) => {
  const colorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentColor, setCurrentColor] = useState("#007AFF");

  useEffect(() => {
    // Animation لتغيير اللون
    const colorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    // Animation للحركة (scale)
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    // الألوان التي سيتغير بينها
    const colors = ["#007AFF", "#4CAF50", "#FF9500", "#FF3B30", "#5856D6"];
    
    const listener = colorAnim.addListener(({ value }) => {
      const index = Math.floor(value * (colors.length - 1));
      const nextIndex = Math.min(index + 1, colors.length - 1);
      const progress = (value * (colors.length - 1)) % 1;
      
      // Interpolate between two colors
      const color1 = colors[index];
      const color2 = colors[nextIndex];
      
      // Simple color interpolation
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * progress);
      const g = Math.round(g1 + (g2 - g1) * progress);
      const b = Math.round(b1 + (b2 - b1) * progress);
      
      setCurrentColor(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    });

    colorAnimation.start();
    scaleAnimation.start();

    return () => {
      colorAnimation.stop();
      scaleAnimation.stop();
      colorAnim.removeListener(listener);
    };
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Ionicons 
        name="cash" 
        size={size} 
        color={currentColor}
      />
    </Animated.View>
  );
};

const BalanceCard = ({ balance }: { balance: number }) => {
  return (
    <View style={{
      backgroundColor: "#FFFFF0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 14, color: theme.colors.mutedText, marginBottom: 8 }}>Available Balance</Text>
      <Text style={{ fontSize: 24, fontWeight: "700", color: theme.colors.text }}>{formatBalance(balance)}</Text>
    </View>
  );
};

type User = {
  id: string;
  username: string;
  imagePath?: string;
};

type Transaction = {
  id: string;
  amount: number;
  sender?: { username: string };
  recipient?: { username: string };
  type?: "sent" | "received" | "deposit" | "withdrawal";
  transactionType?: string;
  createdAt: string;
};

const TransferForm = ({
  visible,
  onClose,
  onTransfer,
  isLoading,
  onInputFocus,
}: {
  visible: boolean;
  onClose: () => void;
  onTransfer: (username: string, amount: number) => void;
  isLoading: boolean;
  onInputFocus?: () => void;
}) => {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");

  if (!visible) return null;

  const handleTransfer = () => {
    const numAmount = parseFloat(amount);
    if (recipientUsername.trim() && numAmount > 0) {
      onTransfer(recipientUsername.trim(), numAmount);
      setRecipientUsername("");
      setAmount("");
    } else {
      Alert.alert("Error", "Please enter a valid username and amount");
    }
  };

  return (
    <View style={{
      backgroundColor: "#FFFFF0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: "#666",
            padding: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>Close</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, textAlign: "left" }}>
          Send Money
        </Text>
      </View>
      
      <Text style={{ fontSize: 14, color: theme.colors.mutedText, marginBottom: 8, textAlign: "left" }}>
        Username
      </Text>
      <TextInput
        value={recipientUsername}
        onChangeText={setRecipientUsername}
        placeholder="Enter username"
        onFocus={onInputFocus}
        style={{
          backgroundColor: "#FFF",
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          textAlign: "left",
        }}
      />

      <Text style={{ fontSize: 14, color: theme.colors.mutedText, marginBottom: 8, textAlign: "left" }}>
        Amount
      </Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
        onFocus={onInputFocus}
        style={{
          backgroundColor: "#FFF",
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          textAlign: "left",
        }}
      />

      <TouchableOpacity
        onPress={handleTransfer}
        disabled={isLoading}
        style={{
          backgroundColor: "#007AFF",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <MoneyLoader size={20} color="#FFF" />
        ) : (
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Send</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const ReceivedTransactions = ({ visible }: { visible: boolean }) => {
  const { data: transactionsData, refetch, isFetching } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactionsApi,
    enabled: visible,
  });

  const transactions: Transaction[] = transactionsData?.data ?? transactionsData ?? [];
  const currentUser = useQuery({ queryKey: ["me"], queryFn: meApi });
  const currentUsername = (currentUser.data?.data ?? currentUser.data)?.username ?? "";

  // Filter only received transactions
  const receivedTransactions = transactions.filter((t) => {
    if (t.recipient?.username === currentUsername) return true;
    return false;
  });

  if (!visible) return null;
//   console.log(transactions)

  return (
    <View style={{
      backgroundColor: "#FFFFF0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      maxHeight: 300,
    }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, marginBottom: 16, textAlign: "left" }}>
        Received Transactions
      </Text>
      {transactions.length === 0 ? (
        <Text style={{ textAlign: "center", color: theme.colors.mutedText, padding: 20 }}>
          No received transactions
        </Text>
      ) : (
        <View style={{ gap: 12 }}>
          {transactions.slice(0, 5).map((transaction) => (
            <View
              key={transaction.id}
              style={{
                backgroundColor: "#FFF",
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#4CAF50",
              }}
            >
              <Text style={{ fontSize: 14, color: theme.colors.mutedText, textAlign: "left" }}>
                From: {transaction.sender?.username ?? "Unknown"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text, textAlign: "left", marginTop: 4 }}>
                {formatBalance(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const QRCodeModal = ({
  visible,
  onClose,
  username,
  userId,
}: {
  visible: boolean;
  onClose: () => void;
  username: string;
  userId: string;
}) => {
  // إنشاء رابط يحتوي على معلومات المستخدم
  const qrData = JSON.stringify({
    type: "send_money",
    username: username,
    userId: userId,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 32,
            width: "100%",
            maxWidth: 350,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
            My QR Code
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginBottom: 24, textAlign: "center" }}>
            Scan this code to send money to {username}
          </Text>
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#007AFF",
            }}
          >
            <QRCode value={qrData} size={200} />
          </View>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 20, textAlign: "center" }}>
            {username}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#007AFF",
              padding: 14,
              borderRadius: 10,
              marginTop: 24,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const ScannerModal = ({
  visible,
  onClose,
  onScanSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (username: string, userId: string) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!visible) {
      setScanned(false);
      setIsProcessing(false);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing || !visible) return;

    setIsProcessing(true);
    setScanned(true);

    try {
      const qrData = JSON.parse(data);

      if (qrData.type === "send_money" && qrData.username && qrData.userId) {
        onScanSuccess(qrData.username, qrData.userId);
        onClose();
      } else {
        Alert.alert("Invalid QR Code", "This QR code is not a valid payment code");
        setScanned(false);
      }
    } catch (error) {
      Alert.alert("Error", "Invalid QR code format");
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={scannerStyles.container}>
        {!permission ? (
          <View style={scannerStyles.centerContainer}>
            <MoneyLoader size={40} color="#fff" />
          </View>
        ) : !permission.granted ? (
          <View style={scannerStyles.centerContainer}>
            <Text style={scannerStyles.message}>We need your permission to use the camera</Text>
            <TouchableOpacity style={scannerStyles.button} onPress={requestPermission}>
              <Text style={scannerStyles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[scannerStyles.button, { marginTop: 12, backgroundColor: "#666" }]} onPress={onClose}>
              <Text style={scannerStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={scannerStyles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            <View style={scannerStyles.overlay}>
              <TouchableOpacity
                style={scannerStyles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <View style={scannerStyles.scanArea}>
                <View style={[scannerStyles.corner, scannerStyles.topLeft]} />
                <View style={[scannerStyles.corner, scannerStyles.topRight]} />
                <View style={[scannerStyles.corner, scannerStyles.bottomLeft]} />
                <View style={[scannerStyles.corner, scannerStyles.bottomRight]} />
              </View>
              <Text style={scannerStyles.instruction}>Scan QR Code to Send Money</Text>
              {scanned && (
                <TouchableOpacity
                  style={scannerStyles.button}
                  onPress={() => setScanned(false)}
                >
                  <Text style={scannerStyles.buttonText}>Tap to Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
};

const scannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#007AFF",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instruction: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 30,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

const SendMoneyFromQRModal = ({
  visible,
  onClose,
  recipientUsername,
  recipientId,
  onTransfer,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  recipientUsername: string;
  recipientId: string;
  onTransfer: (amount: number) => void;
  isLoading: boolean;
}) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!visible) {
      setAmount("");
    }
  }, [visible]);

  const handleIncrease = (value: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  const handleTransfer = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onTransfer(numAmount);
      setAmount("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "left" }}>
            Send Money to {recipientUsername}
          </Text>

          <Text style={{ fontSize: 16, color: "#666", marginBottom: 16, textAlign: "left" }}>Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              marginBottom: 16,
              textAlign: "left",
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            <TouchableOpacity
              onPress={() => handleIncrease(10)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(50)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(100)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+100</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTransfer}
              style={{
                flex: 1,
                backgroundColor: "#007AFF",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <MoneyLoader size={20} color="white" />
              ) : (
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DepositModal = ({
  visible,
  onClose,
  onDeposit,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  isLoading: boolean;
}) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!visible) {
      setAmount("");
    }
  }, [visible]);

  const handleIncrease = (value: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onDeposit(numAmount);
      setAmount("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "left" }}>
            Deposit Money
          </Text>

          <Text style={{ fontSize: 16, color: "#666", marginBottom: 16, textAlign: "left" }}>Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              marginBottom: 16,
              textAlign: "left",
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            <TouchableOpacity
              onPress={() => handleIncrease(10)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(50)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(100)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+100</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeposit}
              style={{
                flex: 1,
                backgroundColor: "#4CAF50",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <MoneyLoader size={20} color="white" />
              ) : (
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Deposit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AllTransactions = ({ visible }: { visible: boolean }) => {
  const { data: transactionsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactionsApi,
    enabled: true,
  });

  const transactions: Transaction[] = transactionsData?.data ?? transactionsData ?? [];
  const currentUser = useQuery({ queryKey: ["me"], queryFn: meApi });
  const currentUsername = (currentUser.data?.data ?? currentUser.data)?.username ?? "";

  // Log data for verification
  useEffect(() => {
    if (visible && transactions.length > 0) {
      console.log("All transactions:", transactions);
      console.log("Transactions count:", transactions.length);
    }
  }, [visible, transactions]);

  if (!visible) return null;

  if (isLoading) {
    return (
      <View style={{
        backgroundColor: "#FFFFF0",
        padding: 20,
        borderRadius: 12,
        width: "100%",
        marginTop: 20,
        alignItems: "center",
      }}>
        <MoneyLoader size={40} color={theme.colors.text} />
      </View>
    );
  }

  // Sort transactions by date (newest first)
  // Handle errors if createdAt is missing
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <View style={{
      backgroundColor: "#FFFFF0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontSize: 12, color: theme.colors.mutedText }}>
          ({sortedTransactions.length} transactions)
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, textAlign: "left" }}>
          My Transactions
        </Text>
      </View>
      {sortedTransactions.length === 0 ? (
        <Text style={{ textAlign: "center", color: theme.colors.mutedText, padding: 20 }}>
          No transactions
        </Text>
      ) : (
        <View style={{ gap: 12 }}>
          {sortedTransactions.map((transaction) => {
            // تحديد نوع المعاملة
            const transactionType = transaction.type || transaction.transactionType || "";
            const isDeposit = transactionType.toLowerCase() === "deposit" || (!transaction.sender && !transaction.recipient && transaction.amount > 0);
            const isWithdrawal = transactionType.toLowerCase() === "withdrawal" || (!transaction.sender && !transaction.recipient && transaction.amount < 0);
            const isReceived = transaction.recipient?.username === currentUsername || (transactionType.toLowerCase() === "received");
            const isSent = transaction.sender?.username === currentUsername || (transactionType.toLowerCase() === "sent");
            
            // تحديد اللون والنص بناءً على نوع المعاملة
            let borderColor = "#E74C3C";
            let amountColor = "#E74C3C";
            let amountPrefix = "-";
            let iconName = "arrow-up-circle";
            let description = "";
            
            if (isDeposit || isReceived) {
              borderColor = "#4CAF50";
              amountColor = "#4CAF50";
              amountPrefix = "+";
              iconName = "arrow-down-circle";
              if (isDeposit) {
                description = "Deposit";
              } else {
                description = `From: ${transaction.sender?.username ?? "Unknown"}`;
              }
            } else if (isWithdrawal || isSent) {
              borderColor = "#E74C3C";
              amountColor = "#E74C3C";
              amountPrefix = "-";
              iconName = "arrow-up-circle";
              if (isWithdrawal) {
                description = "Withdrawal";
              } else {
                description = `To: ${transaction.recipient?.username ?? "Unknown"}`;
              }
            } else {
              // Unknown transaction - display as is
              description = transaction.sender?.username ? `From: ${transaction.sender.username}` : 
                           transaction.recipient?.username ? `To: ${transaction.recipient.username}` : 
                           "Transaction";
            }
            
            return (
              <View
                key={transaction.id}
                style={{
                  backgroundColor: "#FFF",
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: borderColor,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: theme.colors.mutedText, textAlign: "left" }}>
                      {description}
                    </Text>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: "600", 
                      color: amountColor, 
                      textAlign: "left", 
                      marginTop: 4 
                    }}>
                      {amountPrefix} {formatBalance(Math.abs(transaction.amount))}
                    </Text>
                    {transaction.createdAt && (
                      <Text style={{ fontSize: 12, color: theme.colors.mutedText, textAlign: "left", marginTop: 4 }}>
                        {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </Text>
                    )}
                  </View>
                  <Ionicons 
                    name={iconName as any} 
                    size={24} 
                    color={borderColor} 
                    style={{ marginRight: 12 }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default function Home() {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showReceivedTransactions, setShowReceivedTransactions] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSendFromQR, setShowSendFromQR] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [qrRecipient, setQrRecipient] = useState<{ username: string; id: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();

  const { data, isLoading, refetch: refetchMe } = useQuery({
    queryKey: ["me"],
    queryFn: meApi
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const { refetch: refetchTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactionsApi,
  });

  const { logout } = useAuth();
  const router = useRouter();

  const user = data?.data ?? data;
  const username = user?.username ?? "Unknown";
  const userId = user?.id ?? "";
  const image = user?.imagePath;
  const balanceNum = Number(user?.balance ?? 0);

  const users: User[] = usersData?.data ?? usersData ?? [];

  const transferMutation = useMutation({
    mutationFn: transferMoneyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      Alert.alert("Success", "Money sent successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while sending money";
      console.error("Transfer error:", error);
      Alert.alert("Error", errorMessage);
    },
  });

  const depositMutation = useMutation({
    mutationFn: depositMoneyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      Alert.alert("Success", "Money deposited successfully");
      setShowDeposit(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while depositing money";
      console.error("Deposit error:", error);
      Alert.alert("Error", errorMessage);
    },
  });

  const handleTransfer = (recipientUsername: string, amount: number) => {
    // Find user by username
    const recipient = users.find((u) => u.username.toLowerCase() === recipientUsername.toLowerCase());
    
    if (!recipient) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    // Hide form immediately when sending
    setShowTransferForm(false);

    transferMutation.mutate({
        toUserId: recipient.id,
      amount: Number(amount),
    });
  };

  const handleTransferFromQR = (amount: number) => {
    if (!qrRecipient) {
      Alert.alert("Error", "Recipient not found");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    setShowSendFromQR(false);

    transferMutation.mutate({
        toUserId: qrRecipient.id,
      amount: Number(amount),
    });

    setQrRecipient(null);
  };

  const handleQRScanSuccess = (username: string, userId: string) => {
    setQrRecipient({ username, id: userId });
    setShowSendFromQR(true);
  };

  const handleDeposit = (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    depositMutation.mutate({
      amount: Number(amount),
    });
  };

  // معالجة البيانات من Scanner عند مسح الباركود
  useEffect(() => {
    if (params.qrScanned === "true" && params.recipientUsername && params.recipientId) {
      setQrRecipient({
        username: params.recipientUsername as string,
        id: params.recipientId as string,
      });
      setShowSendFromQR(true);
    }
  }, [params.qrScanned, params.recipientUsername, params.recipientId]);

  const handleInputFocus = () => {
    // Scroll page down when keyboard opens
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (showTransferForm) {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return () => {
        keyboardDidShowListener.remove();
      };
    }
  }, [showTransferForm]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchMe(),
        refetchUsers(),
        refetchTransactions(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFACD" }}>
      {/* Red bar at top of page */}
      <View style={{
        backgroundColor: "#E74C3C",
        padding: 16,
        paddingTop: 90,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {isLoading ? (
          <MoneyLoader size={20} color="#FFF" />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {image ? (
              <Image 
                source={{ uri: `https://bank-app-be-eapi-btf5b.ondigitalocean.app/${image}` }} 
                style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#FFF" }} 
              />
            ) : (
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFF", borderWidth: 2, borderColor: "#FFF" }} />
            )}
            <View style={{ alignItems: "flex-start" }}>
              <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600", textAlign: "left" }}>Welcome</Text>
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "500", textAlign: "left" }}>{username}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
          style={{ padding: 8 }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        <BalanceCard balance={balanceNum} />
        
        {!showTransferForm && !showReceivedTransactions && !showQRCode && (
          <View style={{ gap: 12, marginTop: 20 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowTransferForm(true)}
                style={{
                  backgroundColor: "#007AFF",
                  padding: 16,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Send Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowQRCode(true)}
                style={{
                  backgroundColor: "#4CAF50",
                  padding: 16,
                  borderRadius: 12,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Ionicons name="qr-code" size={24} color="#FFF" style={{ marginBottom: 4 }} />
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>My QR Code</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setShowScanner(true)}
              style={{
                backgroundColor: "#FF9500",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="scan" size={24} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Scan QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeposit(true)}
              style={{
                backgroundColor: "#5856D6",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Deposit</Text>
            </TouchableOpacity>
          </View>
        )}

        {showReceivedTransactions && (
          <View>
            <TouchableOpacity
              onPress={() => setShowReceivedTransactions(false)}
              style={{
                backgroundColor: "#666",
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
            <ReceivedTransactions visible={showReceivedTransactions} />
          </View>
        )}

        <TransferForm
          visible={showTransferForm}
          onClose={() => setShowTransferForm(false)}
          onTransfer={handleTransfer}
          isLoading={transferMutation.isPending}
          onInputFocus={handleInputFocus}
        />

        <AllTransactions visible={true} />
      </ScrollView>
      </KeyboardAvoidingView>

      <QRCodeModal
        visible={showQRCode}
        onClose={() => setShowQRCode(false)}
        username={username}
        userId={userId}
      />

      <ScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      <SendMoneyFromQRModal
        visible={showSendFromQR}
        onClose={() => {
          setShowSendFromQR(false);
          setQrRecipient(null);
        }}
        recipientUsername={qrRecipient?.username ?? ""}
        recipientId={qrRecipient?.id ?? ""}
        onTransfer={handleTransferFromQR}
        isLoading={transferMutation.isPending}
      />

      <DepositModal
        visible={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDeposit={handleDeposit}
        isLoading={depositMutation.isPending}
      />
    </View>
  );
}
  