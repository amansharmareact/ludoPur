// screens/AdminLoginScreen.js
import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from "react-native";
import GradientButton from "../components/GradientButton";
import BG from '../assets/images/bg.jpeg';
import api from "../../axios";
import { navigate } from "../helpers/NavigationUtil";
const AdminLogin = ({ navigation }) => {
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            // const res = await api.post("/login-admin", { email: adminId, password });
            // console.log("Login success:", res.data);
            // navigate to admin dashboard screen
            navigate("AdminDashboard");
        } catch (err) {
            console.error(err);
            setError("Invalid credentials");
        }
    };

    const renderButton = useCallback(
        (title, onPress) => <GradientButton title={title} onPress={onPress} />,
        [],
    );

    return (
        <ImageBackground source={BG} resizeMode="cover" style={styles.container}>

            <Text style={styles.title}>Admin Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Admin ID"
                placeholderTextColor="#ccc"
                value={adminId}
                onChangeText={setAdminId}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {renderButton('LOGIN AS ADMIN', handleLogin)}
        </ImageBackground>
    );
};

export default AdminLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: "#333",
        padding: 10,
        fontSize: 22,
        textAlign: "center",
        letterSpacing: 10,
        width: 220,
        borderColor: "yellow",
        borderRadius: 2,
        color: "#fff",
        marginTop: 20,

    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#07c4a6",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
});
