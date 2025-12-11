import React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import DeviceAScreen from "./src/screens/DeviceAScreen"
import DeviceBScreen from "./src/screens/DeviceBScreen"

type DeviceType = "A" | "B" | null

const App: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(null)

  if (selectedDevice === "A") {
    return <DeviceAScreen />
  }

  if (selectedDevice === "B") {
    return <DeviceBScreen />
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Conexão P2P Android</Text>
        <Text style={styles.subtitle}>Selecione o tipo de dispositivo:</Text>

        <TouchableOpacity style={[styles.deviceButton, styles.deviceA]} onPress={() => setSelectedDevice("A")}>
          <Text style={styles.deviceButtonText}>DISPOSITIVO A</Text>
          <Text style={styles.deviceDescription}>Cliente de Pagamento</Text>
          <Text style={styles.deviceFeatures}>
            • Busca dispositivos na rede{"\n"}• Conecta ao Dispositivo B{"\n"}• Envia dados de pagamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deviceButton, styles.deviceB]} onPress={() => setSelectedDevice("B")}>
          <Text style={styles.deviceButtonText}>DISPOSITIVO B</Text>
          <Text style={styles.deviceDescription}>Processador de Pagamentos</Text>
          <Text style={styles.deviceFeatures}>
            • Inicia servidor TCP{"\n"}• Anuncia serviço na rede{"\n"}• Processa pagamentos recebidos
          </Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Como usar:</Text>
          <Text style={styles.instructionsText}>
            1. Configure o Dispositivo B primeiro (inicie o servidor){"\n"}
            2. No Dispositivo A, busque por dispositivos{"\n"}
            3. Conecte ao Dispositivo B encontrado{"\n"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  deviceButton: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  deviceA: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  deviceB: {
    backgroundColor: "#E8F5E8",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  connectionManager: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#FF7700",
  },
  deviceButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  deviceDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  deviceFeatures: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },
  instructions: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})

export default App
