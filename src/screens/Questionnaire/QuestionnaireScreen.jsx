import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
  ImageBackground, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const BG_IMAGE = require('../../../assets/splash-medellin.png');

/* ─── Barra de progreso ─────────────────────────────────────────── */
const ProgressBar = ({ current, total }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: current / total,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [current]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <Text style={styles.progressLabel}>{current} de {total}</Text>
    </View>
  );
};

/* ─── Tarjeta de pregunta ───────────────────────────────────────── */
const QuestionCard = ({ question, selectedId, onAnswer, index, total }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [question.id]);

  return (
    <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Número de pregunta */}
      <View style={styles.questionMeta}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.questionCounter}>Pregunta {index + 1} de {total}</Text>
      </View>

      <Text style={styles.questionText}>{question.question_text}</Text>

      <View style={styles.optionsContainer}>
        {question.options?.map((option, i) => {
          const isSelected = selectedId === option.id;
          const optAnim = useRef(new Animated.Value(0)).current;

          useEffect(() => {
            Animated.timing(optAnim, {
              toValue: 1, duration: 300, delay: i * 60, useNativeDriver: true,
            }).start();
          }, [question.id]);

          return (
            <Animated.View key={option.id} style={{ opacity: optAnim }}>
              <TouchableOpacity
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onAnswer(question.id, option.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionDot, isSelected && styles.optionDotSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};

/* ─── QuestionnaireScreen ───────────────────────────────────────── */
const QuestionnaireScreen = ({ navigation }) => {
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    try {
      const response = await client.get('/questionnaire/questions');
      if (response.data.success) {
        setQuestions(response.data.data.questions);
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    // Avanza automáticamente a la siguiente pregunta tras breve pausa
    if (currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx(i => i + 1), 350);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Atención', 'Por favor responde todas las preguntas');
      return;
    }
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const selectedOption = question.options.find(opt => opt.id === optionId);
        return { question_id: parseInt(questionId), answer: selectedOption.text };
      });

      const response = await client.post('/questionnaire/submit', {
        user_id: user.id,
        answers: formattedAnswers,
      });

      if (response.data.success) {
        Alert.alert('¡Listo!', 'Tus preferencias fueron guardadas', [
          { text: 'Ver recomendaciones', onPress: () => navigation.goBack() }
        ]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo enviar el cuestionario');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered   = answeredCount === questions.length && questions.length > 0;
  const currentQ      = questions[currentIdx];

  if (loading) {
    return (
      <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#C9A227" />
          <Text style={styles.loadingText}>Cargando cuestionario…</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>TurisMed</Text>
          <Text style={styles.headerTitle}>¿Qué te gusta?</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtítulo + progreso */}
        <Text style={styles.subtitle}>
          Cuéntanos tus preferencias para recomendarte los mejores lugares de Medellín
        </Text>

        <ProgressBar current={answeredCount} total={questions.length} />

        {/* Pregunta actual */}
        {currentQ && (
          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            selectedId={answers[currentQ.id]}
            onAnswer={handleAnswer}
            index={currentIdx}
            total={questions.length}
          />
        )}

        {/* Navegación entre preguntas */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIdx === 0 && styles.navBtnDisabled]}
            onPress={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
            <Text style={[styles.navBtnText, currentIdx === 0 && { color: 'rgba(255,255,255,0.3)' }]}>Anterior</Text>
          </TouchableOpacity>

          {currentIdx < questions.length - 1 ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
            >
              <Text style={styles.navBtnText}>Siguiente</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 100 }} />
          )}
        </View>

        {/* Miniaturas de progreso */}
        <View style={styles.dotsRow}>
          {questions.map((q, i) => (
            <TouchableOpacity key={q.id} onPress={() => setCurrentIdx(i)}>
              <View style={[
                styles.dot,
                i === currentIdx && styles.dotActive,
                answers[q.id]   && styles.dotAnswered,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón final */}
        {allAnswered && (
          <Animated.View>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={styles.submitBtnText}>Ver mis recomendaciones</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
              }
            </TouchableOpacity>
          </Animated.View>
        )}

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
    backgroundColor: 'rgba(10, 10, 30, 0.52)',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 14, fontSize: 14 },

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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  appName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C9A227',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },

  /* Progreso */
  progressContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E85D04',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },

  /* Tarjeta de pregunta */
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E85D04',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  questionNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  questionCounter: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 18,
  },
  optionsContainer: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    backgroundColor: '#FFF1E8',
    borderColor: '#E85D04',
  },
  optionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  optionDotSelected: {
    backgroundColor: '#E85D04',
    borderColor: '#E85D04',
  },
  optionText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  optionTextSelected: {
    color: '#E85D04',
    fontWeight: '700',
  },

  /* Navegación */
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
    borderRadius: 4,
  },
  dotAnswered: {
    backgroundColor: '#E85D04',
  },

  /* Botón enviar */
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#E85D04',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E85D04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default QuestionnaireScreen;