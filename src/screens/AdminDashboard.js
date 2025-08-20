import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, TextInput, FlatList, StyleSheet } from "react-native";
import api from "../../axios"; // your axios instance

export default function AdminDashboard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [rooms, setRooms] = useState([]);

    // fetch rooms from backend
    const fetchRooms = async () => {
        try {
            const res = await api.get("/create-room");
            setRooms(res.data);
        } catch (err) {
            console.log("Error fetching rooms", err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // create room API
    const createRoom = async () => {
        if (!roomName.trim()) return;
        try {
            await api.post("/rooms", { name: roomName });
            setRoomName("");
            setModalVisible(false);
            fetchRooms(); // refresh list
        } catch (err) {
            console.log("Error creating room", err);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Create Room" onPress={() => setModalVisible(true)} />

            <FlatList
                data={rooms}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.roomCard}>
                        <Text style={styles.roomText}>Room: {item.name}</Text>
                        <Text style={styles.winnerText}>
                            Winner: {item.winner ? item.winner : "Not declared yet"}
                        </Text>
                    </View>
                )}
            />

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Create Room</Text>
                        <TextInput
                            placeholder="Enter Room Name"
                            style={styles.input}
                            value={roomName}
                            onChangeText={setRoomName}
                            maxLength={6} // ✅ max 6 chars
                            keyboardType="numeric" // ✅ only digits
                        />
                        <View style={{ marginTop: 20 }}>
                            <Button title="Create" onPress={createRoom} />
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    roomCard: {
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        marginTop: 10,
        borderRadius: 8,
    },
    roomText: { fontSize: 16, fontWeight: "bold" },
    winnerText: { fontSize: 14, color: "green", marginTop: 5 },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBox: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
});
