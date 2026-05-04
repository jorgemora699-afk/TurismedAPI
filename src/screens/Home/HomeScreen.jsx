import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  StatusBar,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getRecommendations } from '../../api/placesApi';

const BG_IMAGE = require('../../../assets/splash-medellin.png');

const TYPE_CONFIG = {
  restaurant: { emoji: '🍽️', label: 'Restaurante', color: '#E85D04' },
  bar:        { emoji: '🍺', label: 'Bar',          color: '#9B2226' },
  club:       { emoji: '🎵', label: 'Club',         color: '#6A0572' },
  cafe:       { emoji: '☕', label: 'Café',         color: '#774936' },
  park:       { emoji: '🌳', label: 'Parque',       color: '#386641' },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type] || { emoji: '📍', label: type || 'Lugar', color: '#555' };

/* ─── Tarjeta ───────────────────────────────────────────────────── */
const PlaceCard = ({ item, onPress, index }) => {
  const cfg = getTypeConfig(item.type || item.place_type);
  const fadeAnim  = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
        <View style={[styles.cardSidebar, { backgroundColor: cfg.color }]} />
        <View style={styles.cardBody}>
          <View style={[styles.emojiCircle, { backgroundColor: cfg.color + '18' }]}>
            <Text style={styles.emoji}>{cfg.emoji}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: cfg.color + '15' }]}>
                <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            )}
            {item.address && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color="#aaa" />
                <Text style={styles.address}>{item.address}</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginTop: 2 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── Botón de perfil ───────────────────────────────────────────── */
const ProfileButton = ({ onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim  = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.88, friction: 6, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.75] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {/* Anillo de glow pulsante */}
        <Animated.View
          style={[
            styles.profileGlow,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
        />
        {/* Botón principal */}
        <View style={styles.profileBtn}>
          <Ionicons name="person" size={20} color="#fff" />
          {/* Badge punto */}
          <View style={styles.profileBadge} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ─── HomeScreen ────────────────────────────────────────────────── */
const HomeScreen = ({ navigation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => { loadRecommendations(); }, [])
  );

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await getRecommendations(user.id);
      if (response.success) setRecommendations(response.data);
    } catch {
      Alert.alert(
        'Bienvenido',
        'Primero responde el cuestionario para ver tus recomendaciones',
        [{ text: 'Ir al cuestionario', onPress: () => navigation.navigate('Questionnaire') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.appName}>TurisMed</Text>
        <Text style={styles.greeting}>Hola, {user?.name} </Text>
        <Text style={styles.subtitle}>Lugares recomendados para ti</Text>
      </View>
      <ProfileButton onPress={() => navigation.navigate('Profile')} />
    </View>
  );

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      {loading ? (
        <>
          <ListHeader />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#C9A227" />
            <Text style={styles.loadingText}>Cargando recomendaciones…</Text>
          </View>
        </>
      ) : recommendations.length === 0 ? (
        <>
          <ListHeader />
          <View style={styles.centered}>
            <Text style={{ fontSize: 48, marginBottom: 14 }}>🗺️</Text>
            <Text style={styles.emptyTitle}>Sin recomendaciones aún</Text>
            <Text style={styles.emptyText}>
              Responde el cuestionario y te mostraremos los mejores lugares de Medellín.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Questionnaire')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Responder cuestionario</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <PlaceCard
              item={item}
              index={index}
              onPress={() => navigation.navigate('PlaceDetail', { place: item })}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ImageBackground>
  );
};

/* ─── Estilos ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 30, 0.48)',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  appName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9A227',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  profileBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E85D04',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  profileGlow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E85D04',
    top: 0,
    left: 0,
  },


  listContent: {
    paddingBottom: 40,
  },

  /* Tarjeta — fondo blanco sólido, solo ella */
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',           // ← blanco sólido solo en la tarjeta
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardSidebar: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  placeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  badgeRow: { flexDirection: 'row', marginBottom: 7 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  address: { fontSize: 12, color: '#aaa', marginLeft: 4 },

  /* Estados */
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 14 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;