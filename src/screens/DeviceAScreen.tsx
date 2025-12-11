/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView } from "react-native"
import TcpSocket from "react-native-tcp-socket"
import Zeroconf from "react-native-zeroconf"
import { PaymentData, PaymentResponse, DeviceInfo, ConnectionStatus } from "../types"

const DeviceAScreen: React.FC = () => {
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
		isConnected: false,
	})
	const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([])
	const [logs, setLogs] = useState<string[]>([])
	const [amount, setAmount] = useState<string>("100")
	const [description, setDescription] = useState<string>("Teste de pagamento")
	const [isScanning, setIsScanning] = useState<boolean>(false)

	const socketRef = useRef<any>(null)
	const zeroconfRef = useRef<Zeroconf | null>(null)

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString()
		setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
		console.log(`[Device A] ${message}`)
	}

	useEffect(() => {
		initializeZeroconf()
		return () => {
			cleanup()
		}
	}, [])

	const initializeZeroconf = () => {
		try {
			zeroconfRef.current = new Zeroconf()

			zeroconfRef.current.on("start", () => {
				addLog("Zeroconf iniciado")
			})

			zeroconfRef.current.on("found", (name: string) => {
				addLog(`Serviço encontrado: ${name}`)
			})

			zeroconfRef.current.on("resolved", (service: any) => {
				addLog(`Serviço resolvido: ${service.name} - ${service.host}:${service.port}`)

				const deviceInfo: DeviceInfo = {
					name: service.name,
					host: service.host,
					port: service.port,
					addresses: service.addresses || [service.host],
				}

				setDiscoveredDevices((prev) => {
					const exists = prev.find((d) => d.name === deviceInfo.name)
					if (!exists) {
						return [...prev, deviceInfo]
					}
					return prev
				})
			})

			zeroconfRef.current.on("remove", (name: string) => {
				addLog(`Serviço removido: ${name}`)
				setDiscoveredDevices((prev) => prev.filter((d) => d.name !== name))
			})

			zeroconfRef.current.on("error", (error: any) => {
				addLog(`Erro Zeroconf: ${error.message}`)
			})
		} catch (error: any) {
			addLog(`Erro ao inicializar Zeroconf: ${error.message}`)
		}
	}

	const startScanning = () => {
		try {
			setIsScanning(true)
			setDiscoveredDevices([])
			addLog("Iniciando busca por dispositivos...")

			if (zeroconfRef.current) {
				zeroconfRef.current.scan("payment-device", "tcp", "local.")
			}
		} catch (error: any) {
			addLog(`Erro ao iniciar busca: ${error.message}`)
			setIsScanning(false)
		}
	}

	const stopScanning = () => {
		try {
			setIsScanning(false)
			if (zeroconfRef.current) {
				zeroconfRef.current.stop()
			}
			addLog("Busca interrompida")
		} catch (error: any) {
			addLog(`Erro ao parar busca: ${error.message}`)
		}
	}

	const connectToDevice = (device: DeviceInfo) => {
		try {
			addLog(`Conectando a ${device.name} (${device.host}:${device.port})`)

			const socket = TcpSocket.createConnection({
				port: device.port,
				host: device.host,
			}, () => { })

			socket.on("connect", () => {
				addLog(`Conectado a ${device.name}`)
				setConnectionStatus({
					isConnected: true,
					deviceName: device.name,
					address: `${device.host}:${device.port}`,
				})
				socketRef.current = socket
			})

			socket.on("data", (data: any) => {
				try {
					const response: PaymentResponse = JSON.parse(data.toString())
					addLog(`Resposta recebida: ${response.success ? "SUCESSO" : "FALHA"} - ${response.message}`)

					Alert.alert(
						"Resposta do Pagamento",
						`Status: ${response.success ? "APROVADO" : "REJEITADO"}\nMensagem: ${response.message}`,
						[{ text: "OK" }],
					)
				} catch (error: any) {
					addLog(`Erro ao processar resposta: ${error.message}`)
				}
			})

			socket.on("error", (error: any) => {
				addLog(`Erro de conexão: ${error.message}`)
				setConnectionStatus({ isConnected: false })
			})

			socket.on("close", () => {
				addLog("Conexão fechada")
				setConnectionStatus({ isConnected: false })
				socketRef.current = null
			})
		} catch (error: any) {
			addLog(`Erro ao conectar: ${error.message}`)
		}
	}

	const sendPayment = () => {
		if (!socketRef.current || !connectionStatus.isConnected) {
			Alert.alert("Erro", "Não há conexão ativa")
			return
		}

		const paymentData: PaymentData = {
			id: `PAY_${Date.now()}`,
			amount: Number.parseFloat(amount) || 0,
			description,
			timestamp: Date.now(),
		}

		try {
			const dataString = JSON.stringify(paymentData)
			socketRef.current.write(dataString)
			addLog(`Pagamento enviado: R$ ${paymentData.amount} - ${paymentData.description}`)
		} catch (error: any) {
			addLog(`Erro ao enviar pagamento: ${error.message}`)
		}
	}

	const disconnect = () => {
		if (socketRef.current) {
			socketRef.current.destroy()
			socketRef.current = null
		}
		setConnectionStatus({ isConnected: false })
		addLog("Desconectado")
	}

	const cleanup = () => {
		try {
			if (socketRef.current) {
				socketRef.current.destroy()
			}
			if (zeroconfRef.current) {
				zeroconfRef.current.stop()
			}
		} catch (error: any) {
			console.log("Erro na limpeza:", error.message)
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>DISPOSITIVO A</Text>
				<Text style={styles.subtitle}>Cliente de Pagamento</Text>
			</View>

			<View style={styles.statusContainer}>
				<View
					style={[
						styles.statusIndicator,
						{
							backgroundColor: connectionStatus.isConnected ? "#4CAF50" : "#F44336",
						},
					]}
				/>
				<Text style={styles.statusText}>
					{connectionStatus.isConnected ? `Conectado: ${connectionStatus.deviceName}` : "Desconectado"}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Descoberta de Dispositivos</Text>
				<View style={styles.buttonRow}>
					<TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={startScanning} disabled={isScanning}>
						<Text style={styles.buttonText}>{isScanning ? "Buscando..." : "Buscar Dispositivos"}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.secondaryButton]}
						onPress={stopScanning}
						disabled={!isScanning}
					>
						<Text style={styles.buttonTextSecondary}>Parar</Text>
					</TouchableOpacity>
				</View>

				{discoveredDevices.length > 0 && (
					<View style={styles.devicesContainer}>
						<Text style={styles.devicesTitle}>Dispositivos Encontrados:</Text>
						{discoveredDevices.map((device, index) => (
							<TouchableOpacity key={index} style={styles.deviceItem} onPress={() => connectToDevice(device)}>
								<Text style={styles.deviceName}>{device.name}</Text>
								<Text style={styles.deviceAddress}>
									{device.host}:{device.port}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>

			{connectionStatus.isConnected && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Enviar Pagamento</Text>
					<TextInput
						style={styles.input}
						placeholder="Valor (R$)"
						value={amount}
						onChangeText={setAmount}
						keyboardType="numeric"
					/>
					<TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
					<View style={styles.buttonRow}>
						<TouchableOpacity style={[styles.button, styles.successButton]} onPress={sendPayment}>
							<Text style={styles.buttonText}>Enviar Pagamento</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={disconnect}>
							<Text style={styles.buttonText}>Desconectar</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			<View style={styles.logsContainer}>
				<Text style={styles.sectionTitle}>Logs</Text>
				<ScrollView style={styles.logsScroll}>
					{logs.map((log, index) => (
						<Text key={index} style={styles.logText}>
							{log}
						</Text>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E3F2FD",
		padding: 16,
	},
	header: {
		alignItems: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1976D2",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginTop: 4,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		padding: 12,
		backgroundColor: "white",
		borderRadius: 8,
	},
	statusIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	statusText: {
		fontSize: 16,
		fontWeight: "500",
	},
	section: {
		backgroundColor: "white",
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
		color: "#333",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 8,
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	primaryButton: {
		backgroundColor: "#2196F3",
	},
	secondaryButton: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: "#2196F3",
	},
	successButton: {
		backgroundColor: "#4CAF50",
	},
	dangerButton: {
		backgroundColor: "#F44336",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
	buttonTextSecondary: {
		color: "#2196F3",
		fontWeight: "bold",
	},
	devicesContainer: {
		marginTop: 16,
	},
	devicesTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
	},
	deviceItem: {
		padding: 12,
		backgroundColor: "#F5F5F5",
		borderRadius: 6,
		marginBottom: 8,
	},
	deviceName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	deviceAddress: {
		fontSize: 14,
		color: "#666",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 6,
		padding: 12,
		marginBottom: 12,
		backgroundColor: "#F9F9F9",
	},
	logsContainer: {
		flex: 1,
		backgroundColor: "white",
		padding: 16,
		borderRadius: 8,
	},
	logsScroll: {
		flex: 1,
	},
	logText: {
		fontSize: 12,
		color: "#666",
		marginBottom: 2,
		fontFamily: "monospace",
	},
})

export default DeviceAScreen
