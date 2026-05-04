import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert, ImageBackground,
  StatusBar, Animated, Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BG_IMAGE = require('../../../assets/splash-medellin.png');

/* ─── Helpers ───────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  restaurant: { emoji: '🍽️', label: 'Restaurante' },
  bar:        { emoji: '🍺', label: 'Bar'          },
  nightclub:  { emoji: '🎵', label: 'Discoteca'    },
  cafe:       { emoji: '☕', label: 'Café'          },
  park:       { emoji: '🌳', label: 'Parque'        },
};

const PRICE_CONFIG = {
  1: { symbol: '$',   label: 'Económico' },
  2: { symbol: '$$',  label: 'Moderado'  },
  3: { symbol: '$$$', label: 'Premium'   },
};

/* ─── ActionButton ──────────────────────────────────────────────── */
const ActionButton = ({ iconName, iconBg, label, sub, onPress, delay = 0 }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
      <TouchableOpacity style={[styles.actionBtn, { borderColor: iconBg + '40' }]} onPress={onPress} activeOpacity={0.82}>
        <View style={[styles.actionBtnIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color="#fff" />
        </View>
        <View style={styles.actionBtnText}>
          <Text style={[styles.actionBtnLabel, { color: iconBg }]}>{label}</Text>
          <Text style={styles.actionBtnSub} numberOfLines={1}>{sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={iconBg} style={{ opacity: 0.5 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── InfoRow ───────────────────────────────────────────────────── */
const InfoRow = ({ icon, text, delay = 0, copyable = false }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    if (!copyable) return;
    Clipboard.setString(text);
    setCopied(true);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, friction: 6, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    friction: 6, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.infoRow, copied && styles.infoRowCopied]}
        onLongPress={handleLongPress}
        delayLongPress={300}
        activeOpacity={copyable ? 0.7 : 1}
      >
        <View style={[styles.infoIconBox, copied && styles.infoIconBoxCopied]}>
          <Ionicons
            name={copied ? 'checkmark-outline' : icon}
            size={17}
            color={copied ? '#4caf50' : '#E85D04'}
          />
        </View>
        <Text style={[styles.infoText, copied && styles.infoTextCopied]}>{text}</Text>
        {copyable && !copied && (
          <View style={styles.copyHint}>
            <Ionicons name="copy-outline" size={12} color="#bbb" />
            <Text style={styles.copyHintText}>Mantén</Text>
          </View>
        )}
        {copied && <Text style={styles.copiedLabel}>¡Copiado!</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── PlaceDetailScreen ─────────────────────────────────────────── */
const PlaceDetailScreen = ({ route, navigation }) => {
  const { place } = route.params;

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 0, friction: 7, tension: 50, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeKey    = place.place_type || place.type || '';
  const typeConfig = TYPE_CONFIG[typeKey] || { emoji: '📍', label: typeKey };
  const priceKey   = place.price_range;
  const priceConf  = PRICE_CONFIG[priceKey];

  const openMaps = () => {
    if (!place.address) {
      Alert.alert('Sin dirección', 'Este lugar no tiene dirección registrada');
      return;
    }
    const address = encodeURIComponent(`${place.address}, Medellín, Colombia`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`)
      .catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps'));
  };

  const openWhatsApp = () => {
    if (!place.phone) {
      Alert.alert('Sin teléfono', 'Este lugar no tiene número registrado');
      return;
    }
    const cleaned = place.phone.replace(/\D/g, '');
    const number  = cleaned.startsWith('57') ? cleaned : `57${cleaned}`;
    Linking.openURL(`https://wa.me/${number}`)
      .catch(() => Alert.alert('Error', 'No se pudo abrir WhatsApp'));
  };

  const hasActions = place.address || place.phone;

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appName}>TurisMed</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Hero ── */}
        <Animated.View style={[styles.heroBlock, { opacity: heroAnim }]}>
          <Text style={styles.heroEmoji}>{typeConfig.emoji}</Text>
          <Text style={styles.heroName}>{place.name}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
            </View>
            {place.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#C9A227" />
                <Text style={styles.ratingText}>{place.rating}</Text>
              </View>
            )}
            {(priceConf || place.price_symbol) && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {priceConf ? `${priceConf.symbol} ${priceConf.label}` : place.price_symbol}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Tarjeta principal ── */}
        <Animated.View style={[styles.mainCard, { transform: [{ translateY: cardAnim }] }]}>

          <View style={styles.cardStripe} />

          {/* ── Botones de acción ── */}
          {hasActions && (
            <>
              <View style={styles.actionsSection}>
                <Text style={styles.sectionLabel}>CONTACTO RÁPIDO</Text>
                <View style={styles.actionsRow}>
                  {place.address && (
                    <ActionButton
                      iconName="map"
                      iconBg="#4285F4"
                      label="Google Maps"
                      sub={place.address}
                      onPress={openMaps}
                      delay={100}
                    />
                  )}
                  {place.phone && (
                    <ActionButton
                      iconName="logo-whatsapp"
                      iconBg="#25D366"
                      label="WhatsApp"
                      sub={place.phone}
                      onPress={openWhatsApp}
                      delay={180}
                    />
                  )}
                </View>
              </View>

              <View style={styles.dottedLine}>
                <View style={styles.notchLeft} />
                <View style={styles.dottedInner} />
                <View style={styles.notchRight} />
              </View>
            </>
          )}

          {/* ── Descripción ── */}
          {place.description && (
            <>
              <View style={styles.descSection}>
                <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
                <Text style={styles.descText}>{place.description}</Text>
              </View>

              <View style={styles.dottedLine}>
                <View style={styles.notchLeft} />
                <View style={styles.dottedInner} />
                <View style={styles.notchRight} />
              </View>
            </>
          )}

          {/* ── Info de contacto ── */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>INFORMACIÓN</Text>

            {place.address && (
              <InfoRow icon="location-outline" text={place.address} delay={100} copyable />
            )}
            {place.phone && (
              <InfoRow icon="call-outline" text={place.phone} delay={180} copyable />
            )}
            {place.opening_hours && (
              <InfoRow icon="time-outline" text={place.opening_hours} delay={260} />
            )}

            {!place.address && !place.phone && !place.opening_hours && (
              <Text style={styles.noInfoText}>Sin información de contacto disponible.</Text>
            )}
          </View>

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
    backgroundColor: 'rgba(10, 10, 30, 0.50)',
  },
  scroll: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 10, fontWeight: '700', color: '#C9A227',
    letterSpacing: 5, textTransform: 'uppercase',
  },

  /* Hero */
  heroBlock: {
    alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32,
  },
  heroEmoji: { fontSize: 72, marginBottom: 14 },
  heroName: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    textAlign: 'center', lineHeight: 34, marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
  },
  typeBadge: {
    backgroundColor: '#E85D04',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  typeBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(201,162,39,0.18)',
    borderWidth: 1, borderColor: 'rgba(201,162,39,0.4)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  ratingText: { color: '#C9A227', fontSize: 13, fontWeight: '700' },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  priceBadgeText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },

  /* Tarjeta */
  mainCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 10,
    overflow: 'hidden',
  },
  cardStripe: { height: 4, backgroundColor: '#E85D04' },

  /* Acciones */
  actionsSection: { padding: 16, paddingBottom: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14, padding: 12,
    borderWidth: 1.5,
    flex: 1,
  },
  actionBtnIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  actionBtnText: { flex: 1 },
  actionBtnLabel: { fontSize: 13, fontWeight: '800', marginBottom: 1 },
  actionBtnSub: { fontSize: 10, color: '#aaa', fontWeight: '500' },

  /* Línea punteada */
  dottedLine: { flexDirection: 'row', alignItems: 'center' },
  notchLeft: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff', marginLeft: -8, zIndex: 1,
  },
  notchRight: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff', marginRight: -8, zIndex: 1,
  },
  dottedInner: {
    flex: 1, height: 1,
    borderWidth: 1, borderColor: '#e8e8e8', borderStyle: 'dashed',
  },

  /* Descripción */
  descSection: { padding: 16, paddingTop: 14 },
  sectionLabel: {
    fontSize: 9, fontWeight: '800', color: '#bbb',
    letterSpacing: 1.5, marginBottom: 10,
  },
  descText: { fontSize: 14, color: '#555', lineHeight: 22 },

  /* Info rows */
  infoSection: { padding: 16, paddingTop: 14, gap: 8 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f9f9f9', borderRadius: 12, padding: 11,
  },
  infoRowCopied: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1, borderColor: '#c8e6c9',
  },
  infoIconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: '#FFF1E8',
    alignItems: 'center', justifyContent: 'center',
  },
  infoIconBoxCopied: { backgroundColor: '#e8f5e9' },
  infoText: { fontSize: 13, color: '#444', flex: 1, lineHeight: 18 },
  infoTextCopied: { color: '#4caf50' },
  copyHint: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f0f0f0', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6,
  },
  copyHintText: { fontSize: 10, color: '#bbb', fontWeight: '600' },
  copiedLabel: { fontSize: 11, fontWeight: '700', color: '#4caf50' },
  noInfoText: { fontSize: 13, color: '#bbb', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
});

export default PlaceDetailScreen;