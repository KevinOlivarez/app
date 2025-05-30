import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Recuperación Enviada',
        'Te hemos enviado un correo con instrucciones para restablecer tu contraseña.',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backgroundTop} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Ultra',
              fontSize: 30,
              color: 'white',
              lineHeight: 30,
              textAlign: 'center',
              marginRight: 10,
            }}
          >
            RECREO{'\n'}LOVERS
          </Text>
          <Image
            source={require('../../assets/images/iconsCorazon.png')}
            style={styles.recreoLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <SemiBoldText style={styles.title}>Recuperar Contraseña</SemiBoldText>
          <RegularText style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            recuperar tu contraseña.
          </RegularText>

          <Input
            label="Correo Electrónico"
            placeholder="Ingresa tu correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={Colors.light.darkGray} />}
          />

          <Button
            title="Enviar Instrucciones"
            onPress={handleResetPassword}
            size="large"
            loading={loading}
            style={styles.resetButton}
          />

          <TouchableOpacity
            style={styles.backToLoginContainer}
            onPress={() => router.push('/login')}
          >
            <SemiBoldText style={styles.backToLoginText}>
              Volver a Iniciar Sesión
            </SemiBoldText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: Colors.light.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 150,
    height: 60,
    marginLeft: 16,
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.light.darkGray,
    lineHeight: 24,
  },
  resetButton: {
    marginTop: 16,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  recreoLogo: {
    marginBottom: 18,
    top: 3,
    width: 52,
    height: 52,
  },
});
