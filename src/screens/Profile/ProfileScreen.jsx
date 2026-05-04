import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, ImageBackground, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const BG_IMAGE = require('../../../assets/splash-medellin.png');

/* ─── Input con ícono ───────────────────────────────────────────── */
const FormInput = ({ icon, label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={17} color="#aaa" style={styles.inputIcon} />
      <TextInput style={styles.input} placeholderTextColor="#bbb" color="#1a1a1a" {...props} />
    </View>
  </View>
);

/* ─── ProfileScreen ─────────────────────────────────────────────── */
const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY       = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
    setLoading(true);
    try {
      const response = await client.patch(`/users/${user.id}`, { name, email, phone });
      if (response.data.success) Alert.alert('¡Listo!', 'Perfil actualizado exitosamente');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await client.delete(`/users/${user.id}`);
              if (response.data.success) { Alert.alert('Listo', 'Cuenta eliminada'); logout(); }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const initials = name?.charAt(0).toUpperCase() || '?';
  const isAdmin  = user?.role === 'admin';

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.appName}>TurisMed</Text>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarZone}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
            <Text style={styles.roleText}>{isAdmin ? '👑 Administrador' : '👤 Usuario'}</Text>
          </View>
        </View>

        {/* Card formulario */}
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          <FormInput
            label="Nombre"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
          />
          <FormInput
            label="Correo electrónico"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Tu correo"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput
            label="Teléfono"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            placeholder="Tu teléfono"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Guardar cambios</Text>
                </>
            }
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Cuenta</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#E85D04" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          {/* Eliminar cuenta — solo admin */}
          {isAdmin && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={17} color="#e53935" />
              <Text style={styles.deleteText}>Eliminar cuenta</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
};

/* ─── Estilos ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 30, 0.48)',
  },
  scroll: { paddingBottom: 40 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  appName: {
    fontSize: 10, fontWeight: '700', color: '#C9A227',
    letterSpacing: 5, textTransform: 'uppercase', marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20, fontWeight: '900', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* Avatar */
  avatarZone: { alignItems: 'center', paddingVertical: 28 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: '#d86924',
    padding: 3, marginBottom: 14,
    shadowColor: '#d86924',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
  avatar: {
    flex: 1, borderRadius: 45,
    backgroundColor: '#E85D04',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 38, fontWeight: '900', color: '#fff' },
  userName: {
    fontSize: 22, fontWeight: '900', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6, marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  roleBadgeAdmin: {
    backgroundColor: 'rgba(201,162,39,0.2)',
    borderColor: '#C9A227',
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* Card */
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '800', color: '#1a1a1a',
    marginBottom: 20, letterSpacing: 0.2,
  },

  /* Inputs */
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 7, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e8e8e8',
    borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: '#fafafa', height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1a1a1a' },

  /* Botón guardar */
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#E85D04', borderRadius: 14, height: 54,
    marginTop: 6,
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },

  /* Divider */
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#bbb', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#E85D04',
    borderRadius: 14, height: 52, marginBottom: 10,
  },
  logoutText: { color: '#E85D04', fontSize: 15, fontWeight: '700' },

  /* Eliminar */
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#ffcdd2',
    borderRadius: 14, height: 52, backgroundColor: '#fff5f5',
  },
  deleteText: { color: '#e53935', fontSize: 15, fontWeight: '700' },
});

export default ProfileScreen;