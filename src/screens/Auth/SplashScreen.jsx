import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Ellipse,
  Line,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Avión SVG
const AirplaneIcon = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </Svg>
);

// Fondo completo: atardecer medellín con skyline, metrocable y flores
const MedellinSVG = () => (
  <Svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={StyleSheet.absoluteFillObject}
  >
    <Defs>
      {/* Cielo atardecer */}
      <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#0d1b2a" stopOpacity="1" />
        <Stop offset="0.3" stopColor="#1a2a4a" stopOpacity="1" />
        <Stop offset="0.55" stopColor="#c0531a" stopOpacity="1" />
        <Stop offset="0.72" stopColor="#e8821a" stopOpacity="1" />
        <Stop offset="0.85" stopColor="#f5a623" stopOpacity="1" />
        <Stop offset="1" stopColor="#1a0a00" stopOpacity="1" />
      </LinearGradient>

      {/* Sol */}
      <LinearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#ffe066" stopOpacity="1" />
        <Stop offset="1" stopColor="#f5a623" stopOpacity="1" />
      </LinearGradient>

      {/* Montañas */}
      <LinearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1a3a1a" stopOpacity="1" />
        <Stop offset="1" stopColor="#0a1a0a" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#2a4a2a" stopOpacity="1" />
        <Stop offset="1" stopColor="#0a1a0a" stopOpacity="1" />
      </LinearGradient>

      {/* Edificios */}
      <LinearGradient id="buildingDark" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1a2a3a" stopOpacity="1" />
        <Stop offset="1" stopColor="#080f18" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="buildingMid" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1e3348" stopOpacity="1" />
        <Stop offset="1" stopColor="#0a1520" stopOpacity="1" />
      </LinearGradient>

      {/* Suelo */}
      <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#0a1205" stopOpacity="1" />
        <Stop offset="1" stopColor="#030805" stopOpacity="1" />
      </LinearGradient>
    </Defs>

    {/* ── CIELO ── */}
    <Rect x="0" y="0" width={width} height={height} fill="url(#skyGrad)" />

    {/* ── SOL ── */}
    <Ellipse
      cx={width * 0.5}
      cy={height * 0.58}
      rx={width * 0.09}
      ry={width * 0.09}
      fill="url(#sunGrad)"
      opacity="0.92"
    />
    {/* Halo del sol */}
    <Ellipse
      cx={width * 0.5}
      cy={height * 0.58}
      rx={width * 0.14}
      ry={width * 0.14}
      fill="#f5a623"
      opacity="0.18"
    />
    <Ellipse
      cx={width * 0.5}
      cy={height * 0.58}
      rx={width * 0.2}
      ry={width * 0.2}
      fill="#e8821a"
      opacity="0.1"
    />

    {/* ── MONTAÑAS VERDES (cerros de medellín) ── */}
    {/* Montaña trasera izquierda */}
    <Path
      d={`M${-width * 0.05} ${height * 0.72} L${width * 0.18} ${height * 0.38} L${width * 0.38} ${height * 0.62} L${width * 0.42} ${height * 0.72} Z`}
      fill="url(#mountain1)"
      opacity="0.9"
    />
    {/* Montaña trasera derecha */}
    <Path
      d={`M${width * 0.58} ${height * 0.72} L${width * 0.78} ${height * 0.34} L${width * 1.05} ${height * 0.62} L${width * 1.05} ${height * 0.72} Z`}
      fill="url(#mountain1)"
      opacity="0.9"
    />
    {/* Montaña media izquierda */}
    <Path
      d={`M${-width * 0.05} ${height * 0.78} L${width * 0.22} ${height * 0.5} L${width * 0.45} ${height * 0.72} L${width * 0.45} ${height * 0.78} Z`}
      fill="url(#mountain2)"
      opacity="0.95"
    />
    {/* Montaña media derecha */}
    <Path
      d={`M${width * 0.55} ${height * 0.78} L${width * 0.75} ${height * 0.46} L${width * 1.05} ${height * 0.7} L${width * 1.05} ${height * 0.78} Z`}
      fill="url(#mountain2)"
      opacity="0.95"
    />

    {/* ── SKYLINE MEDELLÍN (edificios) ── */}
    {/* Edificio torre 1 - izquierda */}
    <Rect x={width * 0.04} y={height * 0.6} width={width * 0.06} height={height * 0.2} fill="url(#buildingDark)" />
    <Rect x={width * 0.055} y={height * 0.58} width={width * 0.02} height={height * 0.03} fill="url(#buildingDark)" />

    {/* Edificio torre 2 */}
    <Rect x={width * 0.11} y={height * 0.56} width={width * 0.055} height={height * 0.24} fill="url(#buildingMid)" />
    {/* Antena */}
    <Line x1={width * 0.137} y1={height * 0.56} x2={width * 0.137} y2={height * 0.52} stroke="#1e3348" strokeWidth="1.5" />

    {/* Edificio torre 3 - más alto centro-izq */}
    <Rect x={width * 0.17} y={height * 0.5} width={width * 0.065} height={height * 0.3} fill="url(#buildingDark)" />
    <Rect x={width * 0.182} y={height * 0.47} width={width * 0.025} height={height * 0.04} fill="url(#buildingDark)" />
    <Line x1={width * 0.195} y1={height * 0.47} x2={width * 0.195} y2={height * 0.43} stroke="#1a2a3a" strokeWidth="1.5" />

    {/* Edificio ancho izquierda */}
    <Rect x={width * 0.03} y={height * 0.65} width={width * 0.08} height={height * 0.15} fill="#0f1e2e" />

    {/* Edificio centro-izq pequeño */}
    <Rect x={width * 0.245} y={height * 0.62} width={width * 0.04} height={height * 0.18} fill="url(#buildingMid)" />

    {/* Edificio CENTRAL - el más alto (tipo Torre Coltejer) */}
    <Rect x={width * 0.42} y={height * 0.44} width={width * 0.07} height={height * 0.36} fill="url(#buildingDark)" />
    {/* Punta característica */}
    <Path
      d={`M${width * 0.42} ${height * 0.44} L${width * 0.455} ${height * 0.38} L${width * 0.49} ${height * 0.44} Z`}
      fill="#1a2a3a"
    />
    <Line x1={width * 0.455} y1={height * 0.38} x2={width * 0.455} y2={height * 0.33} stroke="#1a2a3a" strokeWidth="2" />

    {/* Edificio derecha del central */}
    <Rect x={width * 0.5} y={height * 0.52} width={width * 0.055} height={height * 0.28} fill="url(#buildingMid)" />
    <Rect x={width * 0.513} y={height * 0.49} width={width * 0.022} height={height * 0.04} fill="url(#buildingMid)" />

    {/* Edificio torre derecha alta */}
    <Rect x={width * 0.56} y={height * 0.48} width={width * 0.06} height={height * 0.32} fill="url(#buildingDark)" />
    <Line x1={width * 0.59} y1={height * 0.48} x2={width * 0.59} y2={height * 0.43} stroke="#1a2a3a" strokeWidth="1.5" />

    {/* Edificios derecha */}
    <Rect x={width * 0.63} y={height * 0.58} width={width * 0.05} height={height * 0.22} fill="url(#buildingMid)" />
    <Rect x={width * 0.69} y={height * 0.54} width={width * 0.055} height={height * 0.26} fill="url(#buildingDark)" />
    <Rect x={width * 0.75} y={height * 0.62} width={width * 0.045} height={height * 0.18} fill="url(#buildingMid)" />
    <Rect x={width * 0.8} y={height * 0.6} width={width * 0.06} height={height * 0.2} fill="url(#buildingDark)" />
    <Rect x={width * 0.87} y={height * 0.65} width={width * 0.07} height={height * 0.15} fill="#0f1e2e" />

    {/* Ventanas iluminadas - edificio central */}
    <Rect x={width * 0.435} y={height * 0.47} width={width * 0.008} height={height * 0.012} fill="#f5c842" opacity="0.8" />
    <Rect x={width * 0.455} y={height * 0.47} width={width * 0.008} height={height * 0.012} fill="#f5c842" opacity="0.6" />
    <Rect x={width * 0.435} y={height * 0.5} width={width * 0.008} height={height * 0.012} fill="#f5c842" opacity="0.7" />
    <Rect x={width * 0.455} y={height * 0.5} width={width * 0.008} height={height * 0.012} fill="#f5c842" opacity="0.5" />
    <Rect x={width * 0.435} y={height * 0.53} width={width * 0.008} height={height * 0.012} fill="#f5c842" opacity="0.8" />

    {/* Ventanas torre izquierda alta */}
    <Rect x={width * 0.185} y={height * 0.53} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.6" />
    <Rect x={width * 0.2} y={height * 0.53} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.5" />
    <Rect x={width * 0.185} y={height * 0.56} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.7" />

    {/* Ventanas torre derecha */}
    <Rect x={width * 0.57} y={height * 0.52} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.6" />
    <Rect x={width * 0.583} y={height * 0.52} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.5" />
    <Rect x={width * 0.57} y={height * 0.55} width={width * 0.007} height={height * 0.01} fill="#f5c842" opacity="0.7" />

    {/* ── METROCABLE (cables y cabinas) ── */}
    {/* Cable izquierdo - sube desde abajo izquierda hacia la montaña */}
    <Line
      x1={width * 0.05} y1={height * 0.82}
      x2={width * 0.32} y2={height * 0.48}
      stroke="#c8a46e"
      strokeWidth="1.2"
      opacity="0.7"
    />
    {/* Cable derecho */}
    <Line
      x1={width * 0.68} y1={height * 0.82}
      x2={width * 0.92} y2={height * 0.44}
      stroke="#c8a46e"
      strokeWidth="1.2"
      opacity="0.7"
    />

    {/* Cabinas metrocable izquierdo */}
    <Rect x={width * 0.1} y={height * 0.74} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />
    <Rect x={width * 0.17} y={height * 0.67} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />
    <Rect x={width * 0.24} y={height * 0.59} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />

    {/* Cabinas metrocable derecho */}
    <Rect x={width * 0.72} y={height * 0.74} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />
    <Rect x={width * 0.79} y={height * 0.67} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />
    <Rect x={width * 0.855} y={height * 0.59} width={width * 0.028} height={height * 0.018} rx="2" fill="#2a3a4a" opacity="0.9" />

    {/* ── SUELO / BASE ── */}
    <Rect x="0" y={height * 0.8} width={width} height={height * 0.2} fill="url(#groundGrad)" />

    {/* ── FLORES Y ORQUÍDEAS (primer plano) ── */}
    {/* Tallo izquierdo 1 */}
    <Line x1={width * 0.04} y1={height * 1.0} x2={width * 0.06} y2={height * 0.82} stroke="#1a3a0a" strokeWidth="2.5" />
    {/* Flor naranja izquierda */}
    <Ellipse cx={width * 0.06} cy={height * 0.82} rx={width * 0.022} ry={height * 0.015} fill="#e8521a" opacity="0.95" />
    <Ellipse cx={width * 0.06} cy={height * 0.82} rx={width * 0.012} ry={height * 0.008} fill="#f5a623" opacity="0.9" />

    {/* Tallo izquierdo 2 */}
    <Line x1={width * 0.1} y1={height * 1.0} x2={width * 0.08} y2={height * 0.8} stroke="#1a3a0a" strokeWidth="2" />
    {/* Orquídea morada */}
    <Ellipse cx={width * 0.08} cy={height * 0.8} rx={width * 0.018} ry={height * 0.013} fill="#8a2be2" opacity="0.85" />
    <Ellipse cx={width * 0.08} cy={height * 0.8} rx={width * 0.009} ry={height * 0.006} fill="#da70d6" opacity="0.9" />

    {/* Tallo izquierdo 3 */}
    <Line x1={width * 0.14} y1={height * 1.0} x2={width * 0.13} y2={height * 0.84} stroke="#1a3a0a" strokeWidth="2" />
    <Ellipse cx={width * 0.13} cy={height * 0.84} rx={width * 0.016} ry={height * 0.011} fill="#e8521a" opacity="0.8" />
    <Ellipse cx={width * 0.13} cy={height * 0.84} rx={width * 0.008} ry={height * 0.006} fill="#ffe066" opacity="0.9" />

    {/* Hojas izquierda */}
    <Path d={`M${width * 0.06} ${height * 0.88} Q${width * 0.0} ${height * 0.85} ${width * 0.02} ${height * 0.82}`} stroke="#1a4a0a" strokeWidth="2" fill="none" opacity="0.8" />
    <Path d={`M${width * 0.1} ${height * 0.9} Q${width * 0.16} ${height * 0.86} ${width * 0.14} ${height * 0.83}`} stroke="#1a4a0a" strokeWidth="2" fill="none" opacity="0.8" />

    {/* Tallo derecho 1 */}
    <Line x1={width * 0.86} y1={height * 1.0} x2={width * 0.88} y2={height * 0.81} stroke="#1a3a0a" strokeWidth="2.5" />
    <Ellipse cx={width * 0.88} cy={height * 0.81} rx={width * 0.022} ry={height * 0.015} fill="#e8521a" opacity="0.95" />
    <Ellipse cx={width * 0.88} cy={height * 0.81} rx={width * 0.012} ry={height * 0.008} fill="#f5a623" opacity="0.9" />

    {/* Tallo derecho 2 */}
    <Line x1={width * 0.92} y1={height * 1.0} x2={width * 0.93} y2={height * 0.83} stroke="#1a3a0a" strokeWidth="2" />
    <Ellipse cx={width * 0.93} cy={height * 0.83} rx={width * 0.018} ry={height * 0.013} fill="#8a2be2" opacity="0.85" />
    <Ellipse cx={width * 0.93} cy={height * 0.83} rx={width * 0.009} ry={height * 0.006} fill="#da70d6" opacity="0.9" />

    {/* Tallo derecho 3 */}
    <Line x1={width * 0.97} y1={height * 1.0} x2={width * 0.95} y2={height * 0.85} stroke="#1a3a0a" strokeWidth="2" />
    <Ellipse cx={width * 0.95} cy={height * 0.85} rx={width * 0.016} ry={height * 0.011} fill="#ff6b35" opacity="0.85" />
    <Ellipse cx={width * 0.95} cy={height * 0.85} rx={width * 0.008} ry={height * 0.006} fill="#ffe066" opacity="0.9" />

    {/* Hojas derecha */}
    <Path d={`M${width * 0.88} ${height * 0.88} Q${width * 0.95} ${height * 0.85} ${width * 0.96} ${height * 0.82}`} stroke="#1a4a0a" strokeWidth="2" fill="none" opacity="0.8" />
    <Path d={`M${width * 0.92} ${height * 0.9} Q${width * 0.85} ${height * 0.87} ${width * 0.84} ${height * 0.84}`} stroke="#1a4a0a" strokeWidth="2" fill="none" opacity="0.8" />

    {/* Flores pequeñas dispersas en el suelo */}
    <Ellipse cx={width * 0.3} cy={height * 0.9} rx={width * 0.01} ry={height * 0.007} fill="#e8521a" opacity="0.6" />
    <Ellipse cx={width * 0.5} cy={height * 0.93} rx={width * 0.01} ry={height * 0.007} fill="#8a2be2" opacity="0.5" />
    <Ellipse cx={width * 0.7} cy={height * 0.91} rx={width * 0.01} ry={height * 0.007} fill="#e8521a" opacity="0.6" />
  </Svg>
);

export default function SplashScreen({ onFinish }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const circleRotate = useRef(new Animated.Value(0)).current;
  const planeFly = useRef(new Animated.Value(0)).current;
  const planeOpacity = useRef(new Animated.Value(0)).current;
  const loadingFade = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const spinCircle = () => {
    circleRotate.setValue(0);
    Animated.loop(
      Animated.timing(circleRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    StatusBar.setHidden(true);

    Animated.sequence([
      // 1. Fade in fondo + logo
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // 2. Pausa
      Animated.delay(500),

      // 3. Avión despega
      Animated.parallel([
        Animated.timing(planeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(planeFly, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 4. Barra de carga aparece
      Animated.timing(loadingFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // 5. Barra progresa
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),

      // 6. Pausa final
      Animated.delay(300),

      // 7. Fade out
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 700,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      StatusBar.setHidden(false);
      if (onFinish) onFinish();
    });

    spinCircle();
  }, []);

  const circleRotateInterp = circleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const planeFlyX = planeFly.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.4],
  });
  const planeFlyY = planeFly.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.25],
  });

  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      {/* Fondo Medellín */}
      <Animated.View style={[styles.backgroundContainer, { opacity: fadeIn }]}>
        <MedellinSVG />
      </Animated.View>

      {/* Overlay oscuro suave para que el logo resalte */}
      <View style={styles.overlay} />

      {/* Avión volando */}
      <Animated.View
        style={[
          styles.flyingPlane,
          {
            opacity: planeOpacity,
            transform: [
              { translateX: planeFlyX },
              { translateY: planeFlyY },
              { rotate: '-28deg' },
            ],
          },
        ]}
      >
        <AirplaneIcon size={22} color="rgba(255,220,100,0.9)" />
      </Animated.View>

      {/* Logo central */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoFade,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Círculo giratorio */}
        <Animated.View
          style={[
            styles.circleWrapper,
            { transform: [{ rotate: circleRotateInterp }] },
          ]}
        >
          <Svg width={110} height={110} viewBox="0 0 110 110">
            <Circle
              cx="55"
              cy="55"
              r="48"
              stroke="rgba(245,166,35,0.25)"
              strokeWidth="2"
              fill="none"
            />
            <Circle
              cx="55"
              cy="55"
              r="48"
              stroke="#f5a623"
              strokeWidth="2.8"
              fill="none"
              strokeDasharray="190 112"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* Avión en logo */}
        <View style={styles.planeInLogo}>
          <AirplaneIcon size={36} color="#ffffff" />
        </View>

        {/* Nombre */}
        <Text style={styles.appName}>TURISMED</Text>
        <Text style={styles.tagline}>Descubre y Vive</Text>
        <Text style={styles.city}>Medellín 🌺</Text>
      </Animated.View>

      {/* Barra de carga */}
      <Animated.View style={[styles.loadingContainer, { opacity: loadingFade }]}>
        <Text style={styles.loadingText}>Explorando la ciudad de la eterna primavera...</Text>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 35, 0.38)',
  },
  flyingPlane: {
    position: 'absolute',
    top: height * 0.28,
    left: width * 0.33,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
    zIndex: 5,
  },
  circleWrapper: {
    position: 'absolute',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeInLogo: {
    marginBottom: 14,
  },
  appName: {
    marginTop: 66,
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 7,
    textAlign: 'center',
    textShadowColor: 'rgba(245,166,35,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 6,
    textAlign: 'center',
  },
  city: {
    color: '#f5a623',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 5,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f5a623',
    borderRadius: 2,
  },
});