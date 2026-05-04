import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  TextInput, Modal, ImageBackground,
  StatusBar, Animated, Clipboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getActivePromotions, redeemPromotion, getUserPromotions } from '../../api/promotionsApi';
import { useAuth } from '../../context/AuthContext';

const BG_IMAGE = require('../../../assets/splash-medellin.png');

/* ─── Tarjeta de promoción ──────────────────────────────────────── */
const PromoCard = ({ item, isRedeemed, index }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    Clipboard.setString(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryDate = item.expires_at
    ? new Date(item.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Animated.View style={[styles.card, isRedeemed && styles.cardRedeemed, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Franja superior */}
      <View style={[styles.cardStripe, isRedeemed && styles.cardStripeRedeemed]} />

      <View style={styles.cardBody}>
        {/* Ícono */}
        <View style={[styles.promoIconCircle, isRedeemed && styles.promoIconCircleRedeemed]}>
          <Text style={styles.promoEmoji}>{isRedeemed ? '✅' : '🎁'}</Text>
        </View>

        <View style={styles.promoInfo}>
          <Text style={[styles.promoTitle, isRedeemed && styles.promoTitleRedeemed]} numberOfLines={2}>
            {item.description || 'Promoción especial'}
          </Text>
          <Text style={[styles.promoPlace, isRedeemed && { color: '#bbb' }]}>
            📍 {item.place_name || 'Lugar'}
          </Text>
        </View>

        {isRedeemed && (
          <View style={styles.redeemedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
            <Text style={styles.redeemedBadgeText}>Canjeada</Text>
          </View>
        )}
      </View>

      {/* Línea punteada divisoria */}
      <View style={styles.dottedLine}>
        <View style={[styles.notchLeft,  isRedeemed && { backgroundColor: '#f0f0f0' }]} />
        <View style={styles.dottedInner} />
        <View style={[styles.notchRight, isRedeemed && { backgroundColor: '#f0f0f0' }]} />
      </View>

      {/* Código */}
      <View style={styles.codeRow}>
        {/* Izquierda: label + código + botón copiar apilados */}
        <View style={styles.codeLeft}>
          <Text style={styles.codeLabel}>CÓDIGO</Text>
          <Text style={[styles.codeText, isRedeemed && styles.codeTextRedeemed]}>
            {item.code}
          </Text>
          {!isRedeemed && (
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnCopied]}
              onPress={copyCode}
              activeOpacity={0.75}
            >
              <Ionicons
                name={copied ? 'checkmark-outline' : 'copy-outline'}
                size={13}
                color={copied ? '#4caf50' : '#E85D04'}
              />
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextCopied]}>
                {copied ? '¡Copiado!' : 'Copiar código'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Derecha: fecha de vencimiento */}
        {expiryDate && (
          <View style={styles.codeRight}>
            <Text style={styles.expiryLabel}>VENCE</Text>
            <Text style={[styles.expiryText, isRedeemed && { color: '#bbb' }]}>{expiryDate}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

/* ─── PromotionsScreen ──────────────────────────────────────────── */
import { useEffect } from 'react';

const PromotionsScreen = () => {
  const [promotions,  setPromotions]  = useState([]);
  const [redeemedIds, setRedeemedIds] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalVisible,setModalVisible]= useState(false);
  const [code,        setCode]        = useState('');
  const [redeeming,   setRedeeming]   = useState(false);
  const { user } = useAuth();

  const modalSlide = useRef(new Animated.Value(300)).current;

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeResponse, userResponse] = await Promise.all([
        getActivePromotions(),
        getUserPromotions(user.id),
      ]);
      if (activeResponse.success) setPromotions(activeResponse.data.promotions);
      if (userResponse.success)   setRedeemedIds(userResponse.data.redemptions.map(p => p.promotion.id));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las promociones');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(modalSlide, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalSlide, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      setCode('');
    });
  };

  const handleRedeem = async () => {
    if (!code.trim()) { Alert.alert('Error', 'Ingresa un código de promoción'); return; }
    setRedeeming(true);
    try {
      const response = await redeemPromotion(code.trim(), user.id);
      if (response.success) {
        Alert.alert('¡Éxito!', 'Promoción canjeada exitosamente 🎉');
        closeModal();
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Código inválido');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo canjear el código');
    } finally {
      setRedeeming(false);
    }
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        {promotions.length} promoción{promotions.length !== 1 ? 'es' : ''} disponible{promotions.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>TurisMed</Text>
          <Text style={styles.headerTitle}>Promociones 🎁</Text>
          <Text style={styles.headerSubtitle}>Descuentos exclusivos para ti</Text>
        </View>
        <TouchableOpacity style={styles.redeemBtn} onPress={openModal} activeOpacity={0.85}>
          <Ionicons name="qr-code-outline" size={16} color="#fff" />
          <Text style={styles.redeemBtnText}>Canjear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#C9A227" />
          <Text style={styles.loadingText}>Cargando promociones…</Text>
        </View>
      ) : promotions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 14 }}>🎟️</Text>
          <Text style={styles.emptyTitle}>Sin promociones activas</Text>
          <Text style={styles.emptyText}>Vuelve pronto para ver nuevas ofertas en Medellín.</Text>
        </View>
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <PromoCard item={item} isRedeemed={redeemedIds.includes(item.id)} index={index} />
          )}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal canjear */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
        <Animated.View style={[styles.modalSheet, { transform: [{ translateY: modalSlide }] }]}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Canjear código</Text>
          <Text style={styles.modalSubtitle}>Ingresa el código que recibiste en el lugar</Text>

          <View style={styles.codeInputWrapper}>
            <Ionicons name="ticket-outline" size={20} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.codeInput}
              placeholder="Ej: TURIS-ABC123"
              placeholderTextColor="#bbb"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, redeeming && { opacity: 0.7 }]}
            onPress={handleRedeem}
            disabled={redeeming}
            activeOpacity={0.85}
          >
            {redeeming
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Canjear promoción</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 14, fontSize: 14 },

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
    fontSize: 10, fontWeight: '700', color: '#C9A227',
    letterSpacing: 5, textTransform: 'uppercase', marginBottom: 5,
  },
  headerTitle: {
    fontSize: 26, fontWeight: '900', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  headerSubtitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3,
  },
  redeemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E85D04', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  redeemBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  /* Lista */
  listContent: { paddingBottom: 40 },
  listHeader: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  listHeaderText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

  /* Tarjeta tipo ticket */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    overflow: 'hidden',
  },
  cardRedeemed: { backgroundColor: '#f7f7f7' },
  cardStripe: { height: 4, backgroundColor: '#E85D04' },
  cardStripeRedeemed: { backgroundColor: '#ccc' },

  cardBody: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, paddingBottom: 14,
  },
  promoIconCircle: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#FFF1E8',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  promoIconCircleRedeemed: { backgroundColor: '#f0f0f0' },
  promoEmoji: { fontSize: 26 },
  promoInfo: { flex: 1 },
  promoTitle: {
    fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 5, lineHeight: 20,
  },
  promoTitleRedeemed: { color: '#aaa' },
  promoPlace: { fontSize: 12, color: '#E85D04', fontWeight: '600' },

  redeemedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  redeemedBadgeText: { fontSize: 11, color: '#4caf50', fontWeight: '700' },

  /* Línea punteada tipo ticket */
  dottedLine: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 0,
  },
  notchLeft: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff',
    marginLeft: -8,
    zIndex: 1,
  },
  notchRight: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: -8,
    zIndex: 1,
  },
  dottedInner: {
    flex: 1, height: 1,
    borderWidth: 1, borderColor: '#e8e8e8',
    borderStyle: 'dashed',
  },

  /* Código */
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  codeLeft: { flex: 1, gap: 6 },
  codeLabel: { fontSize: 9, fontWeight: '800', color: '#bbb', letterSpacing: 1.5 },
  codeText: { fontSize: 18, fontWeight: '900', color: '#E85D04', letterSpacing: 2 },
  codeTextRedeemed: { color: '#bbb' },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5,
    borderColor: '#E85D04', backgroundColor: '#FFF1E8',
    alignSelf: 'flex-start',      // ← no se estira, toma solo lo necesario
  },
  copyBtnCopied: { borderColor: '#4caf50', backgroundColor: '#e8f5e9' },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: '#E85D04' },
  copyBtnTextCopied: { color: '#4caf50' },
  codeRight: { alignItems: 'flex-end', justifyContent: 'center' },
  expiryLabel: { fontSize: 9, fontWeight: '800', color: '#bbb', letterSpacing: 1.5, marginBottom: 3 },
  expiryText: { fontSize: 13, fontWeight: '700', color: '#888' },

  /* Empty */
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  emptyText:  { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 21 },

  /* Modal */
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0', alignSelf: 'center', marginBottom: 24,
  },
  modalTitle:    { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },

  codeInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e8e8e8',
    borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: '#fafafa', height: 56, marginBottom: 16,
  },
  codeInput: {
    flex: 1, fontSize: 18, fontWeight: '700',
    letterSpacing: 2, color: '#1a1a1a',
  },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#E85D04', borderRadius: 14, height: 54,
    marginBottom: 12,
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },

  cancelBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
});

export default PromotionsScreen;