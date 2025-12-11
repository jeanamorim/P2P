/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native"
import TcpSocket from "react-native-tcp-socket"
import Zeroconf from "react-native-zeroconf"
import { PaymentData, PaymentResponse } from "../types"

const DeviceBScreen: React.FC = () => {
	const [isServerRunning, setIsServerRunning] = useState<boolean>(false)
	const [connectedClients, setConnectedClients] = useState<number>(0)
	const [logs, setLogs] = useState<string[]>([])
	const [processedPayments, setProcessedPayments] = useState<PaymentResponse[]>([])

	const serverRef = useRef<any>(null)
	const zeroconfRef = useRef<Zeroconf | null>(null)
	const clientsRef = useRef<any[]>([])

	const SERVER_PORT = 8080
	const SERVICE_NAME = "PaymentDevice-B"

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString()
		setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
		console.log(`[Device B] ${message}`)
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
			addLog("Zeroconf inicializado")
		} catch (error: any) {
			addLog(`Erro ao inicializar Zeroconf: ${error.message}`)
		}
	}

	const startServer = () => {
		try {
			addLog("Iniciando servidor...")

			const server = TcpSocket.createServer((socket: any) => {
				addLog(`Cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`)

				clientsRef.current.push(socket)
				setConnectedClients(clientsRef.current.length)

				socket.on("data", (data: Buffer) => {
					try {
						const paymentData: PaymentData = JSON.parse(data.toString())
						addLog(`Pagamento recebido: R$ ${paymentData.amount} - ${paymentData.description}`)

						// Simular processamento de pagamento
						const response = processPayment(paymentData)

						// Enviar resposta
						socket.write(JSON.stringify(response))

						setProcessedPayments((prev) => [response, ...prev.slice(0, 9)])
					} catch (error: any) {
						addLog(`Erro ao processar dados: ${error.message}`)

						const errorResponse: PaymentResponse = {
							id: "ERROR",
							success: false,
							message: "Erro ao processar pagamento",
							timestamp: Date.now(),
						}

						socket.write(JSON.stringify(errorResponse))
					}
				})

				socket.on("error", (error: any) => {
					addLog(`Erro do cliente: ${error.message}`)
				})

				socket.on("close", () => {
					addLog("Cliente desconectado")
					clientsRef.current = clientsRef.current.filter((c) => c !== socket)
					setConnectedClients(clientsRef.current.length)
				})
			})

			server.listen({ port: SERVER_PORT, host: "0.0.0.0" }, () => {
				addLog(`Servidor iniciado na porta ${SERVER_PORT}`)
				setIsServerRunning(true)
				serverRef.current = server

				// Anunciar serviço via Zeroconf
				publishService()
			})

			server.on("error", (error: any) => {
				addLog(`Erro do servidor: ${error.message}`)
				setIsServerRunning(false)
			})
		} catch (error: any) {
			addLog(`Erro ao iniciar servidor: ${error.message}`)
		}
	}

	const publishService = () => {
		try {
			if (zeroconfRef.current) {
				zeroconfRef.current.publishService("payment-device", "tcp", "local.", SERVICE_NAME, SERVER_PORT)
				addLog(`Serviço anunciado: ${SERVICE_NAME}`)
			}
		} catch (error: any) {
			addLog(`Erro ao anunciar serviço: ${error.message}`)
		}
	}

	const stopServer = () => {
		try {
			if (serverRef.current) {
				// Fechar todas as conexões de clientes
				clientsRef.current.forEach((client) => {
					try {
						client.destroy()
					} catch {
						// Ignorar erros ao fechar conexões
					}
				})
				clientsRef.current = []
				setConnectedClients(0)

				// Fechar servidor
				serverRef.current.close()
				serverRef.current = null
				setIsServerRunning(false)

				// Parar anúncio do serviço
				if (zeroconfRef.current) {
					zeroconfRef.current.unpublishService(SERVICE_NAME)
				}

				addLog("Servidor parado")
			}
		} catch (error: any) {
			addLog(`Erro ao parar servidor: ${error.message}`)
		}
	}

	const processPayment = (paymentData: PaymentData): PaymentResponse => {
		// Simular processamento (70% de sucesso)
		const success = Math.random() > 0.3

		const response: PaymentResponse = {
			id: paymentData.id,
			success,
			message: success ? `Pagamento de R$ ${paymentData.amount} aprovado` : "Pagamento rejeitado - Saldo insuficiente",
			timestamp: Date.now(),
		}

		addLog(`Processamento: ${success ? "APROVADO" : "REJEITADO"} - R$ ${paymentData.amount}`)

		return response
	}

	const clearLogs = () => {
		setLogs([])
	}

	const clearPayments = () => {
		setProcessedPayments([])
	}

	const cleanup = () => {
		try {
			if (serverRef.current) {
				serverRef.current.close()
			}
			if (zeroconfRef.current) {
				zeroconfRef.current.stop()
			}
			clientsRef.current.forEach((client) => {
				try {
					client.destroy()
				} catch {
					// Ignorar erros
				}
			})
		} catch (error: any) {
			console.log("Erro na limpeza:", error.message)
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>DISPOSITIVO B</Text>
				<Text style={styles.subtitle}>Processador de Pagamentos</Text>
			</View>

			<View style={styles.statusContainer}>
				<View
					style={[
						styles.statusIndicator,
						{
							backgroundColor: isServerRunning ? "#4CAF50" : "#F44336",
						},
					]}
				/>
				<Text style={styles.statusText}>
					{isServerRunning ? `Servidor Ativo - ${connectedClients} cliente(s)` : "Servidor Inativo"}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Controle do Servidor</Text>
				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[styles.button, styles.successButton]}
						onPress={startServer}
						disabled={isServerRunning}
					>
						<Text style={styles.buttonText}>Iniciar Servidor</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.dangerButton]}
						onPress={stopServer}
						disabled={!isServerRunning}
					>
						<Text style={styles.buttonText}>Parar Servidor</Text>
					</TouchableOpacity>
				</View>
				<Text style={styles.infoText}>Porta: {SERVER_PORT}</Text>
				<Text style={styles.infoText}>Serviço: {SERVICE_NAME}</Text>
			</View>

			{processedPayments.length > 0 && (
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Pagamentos Processados</Text>
						<TouchableOpacity onPress={clearPayments}>
							<Text style={styles.clearButton}>Limpar</Text>
						</TouchableOpacity>
					</View>
					<ScrollView style={styles.paymentsScroll}>
						{processedPayments.map((payment, index) => (
							<View
								key={index}
								style={[
									styles.paymentItem,
									{
										backgroundColor: payment.success ? "#E8F5E8" : "#FFEBEE",
									},
								]}
							>
								<Text style={styles.paymentId}>ID: {payment.id}</Text>
								<Text
									style={[
										styles.paymentStatus,
										{
											color: payment.success ? "#4CAF50" : "#F44336",
										},
									]}
								>
									{payment.success ? "APROVADO" : "REJEITADO"}
								</Text>
								<Text style={styles.paymentMessage}>{payment.message}</Text>
								<Text style={styles.paymentTime}>{new Date(payment.timestamp).toLocaleTimeString()}</Text>
							</View>
						))}
					</ScrollView>
				</View>
			)}

			<View style={styles.logsContainer}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Logs do Sistema</Text>
					<TouchableOpacity onPress={clearLogs}>
						<Text style={styles.clearButton}>Limpar</Text>
					</TouchableOpacity>
				</View>
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
		backgroundColor: "#E8F5E8",
		padding: 16,
	},
	header: {
		alignItems: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#388E3C",
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
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	clearButton: {
		color: "#2196F3",
		fontSize: 14,
		fontWeight: "bold",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 12,
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 6,
		alignItems: "center",
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
	infoText: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	paymentsScroll: {
		maxHeight: 200,
	},
	paymentItem: {
		padding: 12,
		borderRadius: 6,
		marginBottom: 8,
	},
	paymentId: {
		fontSize: 12,
		color: "#666",
		fontFamily: "monospace",
	},
	paymentStatus: {
		fontSize: 16,
		fontWeight: "bold",
		marginVertical: 4,
	},
	paymentMessage: {
		fontSize: 14,
		color: "#333",
	},
	paymentTime: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
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

export default DeviceBScreen
