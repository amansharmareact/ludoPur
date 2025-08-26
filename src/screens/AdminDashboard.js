import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import api from '../../axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState([]);

  // room details modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [role, setRole] = useState(true);

  // new states for admin creation
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('admin');

  const fetchRooms = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setRole(role);
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch (err) {
      console.log('Error fetching rooms', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // create room API
  const createRoom = async () => {
    if (!roomName.trim()) return;
    try {
      await api.post('/create-room', {code: roomName});
      setRoomName('');
      setModalVisible(false);
      fetchRooms();
    } catch (err) {
      console.log('Error creating room', err);
    }
  };

  // create admin API
  const createAdmin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    try {
      console.log({
        email: adminEmail,
        password: adminPassword,
        role: adminRole,
      });
      const res = await api.post('/register-admin', {
        email: adminEmail,
        password: adminPassword,
        role: adminRole,
      });
      setAdminEmail('');
      setAdminPassword('');
      setAdminModalVisible(false);
      alert('✅ Admin created successfully');
    } catch (err) {
      console.log('Error creating admin', err.response.data.message);
      alert('❌ Failed to create admin');
    }
  };

  // set winner
  const handleSetWinner = async () => {
    if (!selectedRoom || !selectedPlayer || !selectedNumber) return;
    try {
      await api.post(`/adminRoll/${selectedRoom._id}`, {
        player: selectedPlayer,
        number: selectedNumber,
      });
      setSelectedRoom(null);
      setSelectedPlayer(null);
      setSelectedNumber(null);
      fetchRooms();
    } catch (err) {
      console.log('Error setting winner', err);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {marginTop: Platform.OS == 'ios' ? StatusBar.currentHeight + 30 : 0},
      ]}>
      {/* Create Room Button */}
      <TouchableOpacity
        style={styles.createRoomBtn}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.createRoomText}>Create Room</Text>
      </TouchableOpacity>

      {/* Create Admin Button */}
      {role !== 'admin' && (
        <TouchableOpacity
          style={styles.createRoomBtn}
          onPress={() => setAdminModalVisible(true)}>
          <Text style={styles.createRoomText}>Create Admin</Text>
        </TouchableOpacity>
      )}

      {/* Rooms List */}
      <FlatList
        data={rooms}
        keyExtractor={item => item._id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.roomCard}
            activeOpacity={role == 'admin' ? 1 : 0}
            onPress={() => {
              if (role !== 'admin') {
                setSelectedRoom(item);
                setSelectedPlayer(null);
                setSelectedNumber(null);
              }
            }}>
            <Text style={styles.roomText}>Room: {item.code}</Text>
            <Text style={styles.winnerText}>
              Winner: {item.winner ? item.winner : 'Not declared yet'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Create Room Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Room</Text>
            <TextInput
              placeholder="Enter Room Code"
              style={styles.input}
              value={roomName}
              onChangeText={setRoomName}
              maxLength={6}
              keyboardType="numeric"
            />

            <View style={{marginTop: 20}}>
              <Button title="Create" onPress={createRoom} />
            </View>
            <View style={{marginTop: 10}}>
              <Button
                title="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Admin Modal */}
      <Modal visible={adminModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Admin</Text>

            <TextInput
              placeholder="Enter Admin Email"
              style={styles.input}
              value={adminEmail}
              onChangeText={setAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Enter Admin Password"
              style={styles.input}
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
            />

            {/* Role Selection */}
            <Text style={[styles.sectionTitle,{marginTop:15}]}>Select Role:</Text>
            <View
              style={{
                marginTop: 10,
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginHorizontal:20
              }}>
              {/* Superadmin */}
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setAdminRole('superadmin')}>
                <View
                  style={[
                    styles.radioCircle,
                    adminRole === 'superadmin' && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Superadmin</Text>
              </TouchableOpacity>

              {/* Admin */}
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setAdminRole('admin')}>
                <View
                  style={[
                    styles.radioCircle,
                    adminRole === 'admin' && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Admin</Text>
              </TouchableOpacity>
            </View>

            <View style={{marginTop: 20}}>
              <Button title="Create Admin" onPress={createAdmin} />
            </View>
            <View style={{marginTop: 10}}>
              <Button
                title="Cancel"
                color="red"
                onPress={() => setAdminModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Room Details Modal */}
      <Modal
        visible={!!selectedRoom}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRoom(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            {selectedRoom && (
              <>
                <Text style={styles.modalTitle}>Room: {selectedRoom.code}</Text>

                <Text style={styles.sectionTitle}>Select Player:</Text>
                {selectedRoom.players.map(p => (
                  <TouchableOpacity
                    key={p._id}
                    style={styles.radioRow}
                    onPress={() => setSelectedPlayer(p.name)}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedPlayer === p.name && styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioLabel}>{p.name}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, {marginTop: 15}]}>
                  Select Number:
                </Text>
                <View style={styles.numberRow}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <TouchableOpacity
                      key={num}
                      style={styles.numberBox}
                      onPress={() => setSelectedNumber(num)}>
                      <View
                        style={[
                          styles.radioCircle,
                          selectedNumber === num && styles.radioSelected,
                        ]}
                      />
                      <Text style={styles.radioLabel}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{marginTop: 20}}>
                  <Button title="Set" onPress={handleSetWinner} />
                </View>
                <View style={{marginTop: 10}}>
                  <Button
                    title="Cancel"
                    color="red"
                    onPress={() => setSelectedRoom(null)}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  roomCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    borderRadius: 8,
  },
  createRoomBtn: {
    backgroundColor: '#4c1e1e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  createRoomText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  roomText: {fontSize: 16, fontWeight: 'bold'},
  winnerText: {fontSize: 14, color: 'green', marginTop: 5},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {fontSize: 18, marginBottom: 10, fontWeight: 'bold'},
  sectionTitle: {fontSize: 16, fontWeight: '600', marginBottom: 5},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  radioRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#333',
    marginRight: 10,
  },
  radioSelected: {backgroundColor: '#4c1e1e'},
  radioLabel: {fontSize: 16},
  numberRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 5},
  numberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
});
