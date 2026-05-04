import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ⚠️ Ajusta esta ruta según donde pongas la imagen en tu proyecto
const BG_IMAGE = require('../../../assets/splash-medellin.png');

const DOTS_COUNT = 6;

const SplashScreen = ({ onFinish }) => {
  const overlayOpacity  = useRef(new Animated.Value(0)).current;
  const planeY          = useRef(new Animated.Value(-40)).current;
  const planeOpacity    = useRef(new Animated.Value(0)).current;
  const ringOpacity     = useRef(new Animated.Value(0)).current;
  const ringScaleY      = useRef(new Animated.Value(0)).current;
  const titleOpacity    = useRef(new Animated.Value(0)).current;
  const titleY          = useRef(new Animated.Value(24)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const cityOpacity     = useRef(new Animated.Value(0)).current;
  const cityY           = useRef(new Animated.Value(10)).current;
  const loadingOpacity  = useRef(new Animated.Value(0)).current;
  const dotsOpacity     = useRef(new Animated.Value(0)).current;
  const screenFadeOut   = useRef(new Animated.Value(1)).current;
  const activeDot       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeDot, { toValue: 5, duration: 2400, useNativeDriver: false }),
        Animated.timing(activeDot, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );

    const sequence = Animated.sequence([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),

      Animated.parallel([
        Animated.timing(planeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(planeY, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(ringScaleY, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),

      Animated.timing(subtitleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),

      Animated.parallel([
        Animated.timing(cityOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(cityY, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(loadingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // ⏱️ Tiempo visible — cámbialo aquí para ajustar duración
      Animated.delay(3500),

      Animated.timing(screenFadeOut, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]);

    dotLoop.start();
    sequence.start(() => {
      dotLoop.stop();
      onFinish && onFinish();
    });

    return () => dotLoop.stop();
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenFadeOut }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">

        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />

        {/* ── LOGO ZONE ── */}
        <View style={styles.logoZone}>

          <Animated.View style={{ opacity: planeOpacity, transform: [{ translateY: planeY }] }}>
            <Ionicons name="airplane" size={30} color="#FFFFFF" />
          </Animated.View>

          <Animated.View
            style={[
              styles.arcWrapper,
              { opacity: ringOpacity, transform: [{ scaleY: ringScaleY }] },
            ]}
          >
            <View style={styles.arcLine} />
            <View style={styles.arc} />
          </Animated.View>

          <Animated.Text
            style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
          >
            TURISMED
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Descubre y Vive
          </Animated.Text>

          <Animated.Text
            style={[styles.city, { opacity: cityOpacity, transform: [{ translateY: cityY }] }]}
          >
            Medellín 🌺
          </Animated.Text>
        </View>

        {/* ── BOTTOM ZONE ── */}
        <View style={styles.bottomZone}>
          <Animated.Text style={[styles.loading, { opacity: loadingOpacity }]}>
            CARGANDO EXPERIENCIAS...
          </Animated.Text>

          <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
            {Array.from({ length: DOTS_COUNT }).map((_, i) => {
              const dotColor = activeDot.interpolate({
                inputRange: [i - 0.4, i, i + 0.4],
                outputRange: ['rgba(255,255,255,0.3)', '#C9A227', 'rgba(255,255,255,0.3)'],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { backgroundColor: dotColor }]}
                />
              );
            })}
          </Animated.View>
        </View>

      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 30, 0.22)',
  },
  logoZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.10,
  },
  arcWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },
  arcLine: {
    width: 2,
    height: 18,
    backgroundColor: '#C9A227',
  },
  arc: {
    width: 90,
    height: 46,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderColor: '#C9A227',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 7,
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 2.5,
    marginTop: 6,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  city: {
    fontSize: 17,
    color: '#C9A227',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomZone: {
    paddingBottom: height * 0.06,
    alignItems: 'center',
    gap: 12,
  },
  loading: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SplashScreen;