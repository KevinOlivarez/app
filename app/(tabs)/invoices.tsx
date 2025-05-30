import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText, BoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  AlarmClock,
  Camera,
  CircleX,
  CopyX,
  CirclePlus as PlusCircle,
  Upload,
  X,
  Circle as XCircle,
} from 'lucide-react-native';
import Input from '@/components/ui/Input';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { getUserInfo } from '@/utils/storage';

const API_BASE = 'https://backend.ccelrecreo.com/server.php/api';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState<any>(null);
  const [showImageButtons, setShowImageButtons] = useState(true);

  const [empresaOptions, setEmpresaOptions] = useState<any[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  const [campaniaOptions, setCampaniaOptions] = useState<any[]>([]);
  const [selectedCampania, setSelectedCampania] = useState(null);

  const [formasPagoOptions, setFormasPagoOptions] = useState<any[]>([]);
  const [selectedFormaPago, setSelectedFormaPago] = useState(null);

  const [openEmpresa, setOpenEmpresa] = useState(false);
  const [openCampania, setOpenCampania] = useState(false);
  const [openFormaPago, setOpenFormaPago] = useState(false);

  useEffect(() => {
    loadPendingInvoices();
    loadInitialData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadPendingInvoices = async () => {
    const user = await getUserInfo();

    if (!user || !user.ID_CUENTAS) {
      Alert.alert('Error', 'ID de usuario no encontrado');
      return;
    }

    const idCuenta = user.ID_CUENTAS;

    try {
      const response = await axios.get(
        `${API_BASE}/canjeappListPendientes/${idCuenta}`
      );
      setInvoices(
        response.data.map((invoice: any) => ({
          ...invoice,
          id: invoice.ID_CANJESDETALLEAPP,
          number: invoice.NUMEROFACTURAS_CANJESDETALLEAPP,
          amount: invoice.MONTOFACTURAS_CANJESDETALLEAPP,
          date: formatDate(invoice.CREATED_AT),
          empresa: invoice.NOMBRECOMERCIAL_EMPRESA,
          status: invoice.ESTADO_CANJESDETALLE,
        }))
      );
    } catch (error) {
      console.error('Error cargando facturas pendientes:', error);
      Alert.alert('Error', 'No se pudieron cargar las facturas pendientes');
    }
  };

  const loadInitialData = async () => {
    try {
      const [empresasRes, formasPagoRes] = await Promise.all([
        axios.get(`${API_BASE}/empresas`),
        axios.get(`${API_BASE}/formasPagos`),
      ]);

      const filteredEmpresas = empresasRes.data
        .filter((e) => e.ESTADO_EMPRESA === 1)
        .map((e) => ({
          label: e.NOMBRECOMERCIAL_EMPRESA,
          value: e.ID_EMPRESA,
        }));
      setEmpresaOptions(filteredEmpresas);

      const filteredFormasPago = formasPagoRes.data
        .filter((f) => f.ESTADO_FORMADEPAGO === 'A')
        .map((f) => ({
          label: f.NOMBRE_FORMADEPAGO,
          value: f.ID_FORMADEPAGO,
        }));
      setFormasPagoOptions(filteredFormasPago);

      await getCampania();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    }
  };

  const getCampania = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/campanias`);
      const activeCampanias = data.data.data
        .filter((c) => c.ESTADO_CAMPANIAS === 'A')
        .map((c) => ({
          label: c.NOMBRE_CAMPANIAS,
          value: c.ID_CAMPANIAS,
        }));

      setCampaniaOptions(activeCampanias);
      if (activeCampanias.length === 1) {
        setSelectedCampania(activeCampanias[0].value);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las campañas');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para acceder a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
      setShowImageButtons(false);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
      setShowImageButtons(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setShowImageButtons(true);
  };

  const addInvoice = async () => {
    const user = await getUserInfo();

    if (
      !invoiceNumber ||
      !amount ||
      !selectedEmpresa ||
      !selectedCampania ||
      !selectedFormaPago ||
      !image ||
      !user?.ID_CUENTAS
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    const formData = new FormData();
    formData.append('id_cuentas', user.ID_CUENTAS);
    formData.append('id_empresa', selectedEmpresa);
    formData.append('id_formadepago', selectedFormaPago);
    formData.append('id_campanias', selectedCampania);
    formData.append('numero_factura', invoiceNumber);
    formData.append('monto_factura', amount);
    formData.append('total_articulos', 1);
    formData.append('archivo_factura', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'invoice.jpg',
    });

    try {
      const response = await axios.post(`${API_BASE}/canjeappSave`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        Alert.alert('Éxito', 'Factura guardada correctamente');
        resetForm();
        loadPendingInvoices();
      } else {
        Alert.alert('Error', 'No se pudo guardar la factura');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      Alert.alert('Error', 'Ocurrió un error al guardar la factura');
    }
  };

  const resetForm = () => {
    setInvoiceNumber('');
    setAmount('');
    setDate('');
    setSelectedEmpresa(null);
    setSelectedCampania(null);
    setSelectedFormaPago(null);
    setImage(null);
    setShowImageButtons(true);
    setShowForm(false);
  };
  const renderInvoiceItem = ({ item: invoice }) => (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <SemiBoldText style={styles.invoiceNumber}>
          Factura #{invoice.number}
        </SemiBoldText>
        <RegularText style={styles.pendingStatus}>Pendiente</RegularText>
      </View>
      <RegularText>Monto: ${invoice.amount}</RegularText>
      <RegularText>Fecha: {invoice.date}</RegularText>
      <RegularText>Empresa: {invoice.empresa}</RegularText>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BoldText style={styles.title}>Mis Facturas</BoldText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.addCard}>
          <SemiBoldText style={styles.addCardTitle}>
            Añadir Factura
          </SemiBoldText>
          <RegularText style={styles.addCardSubtitle}>
            Ingresa los detalles de tu factura
          </RegularText>
          <View style={styles.addButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowForm(!showForm)}
            >
              <View style={styles.uploadIcon}>
                <PlusCircle size={32} color={Colors.light.primary} />
              </View>
              <RegularText style={styles.uploadText}>Añadir Manual</RegularText>
            </TouchableOpacity>
          </View>
        </Card>

        {showForm && (
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <SemiBoldText style={styles.formTitle}>
                Datos de la Factura
              </SemiBoldText>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <CircleX size={24} color={Colors.light.darkGray} />
              </TouchableOpacity>
            </View>

            {showImageButtons && (
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleTakePhoto}
                >
                  <Camera size={24} color={Colors.light.primary} />
                  <RegularText style={styles.imageButtonText}>
                    Tomar Foto
                  </RegularText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleChoosePhoto}
                >
                  <Upload size={24} color={Colors.light.primary} />
                  <RegularText style={styles.imageButtonText}>
                    Subir Imagen
                  </RegularText>
                </TouchableOpacity>
              </View>
            )}

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <CircleX size={20} color={Colors.light.white} />
                </TouchableOpacity>
              </View>
            )}

            <Input
              label="Número de Factura"
              placeholder="Ingresa el número"
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
            />

            <Input
              label="Monto"
              placeholder="Ingresa el monto"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Input
              label="Fecha"
              placeholder="DD/MM/AAAA"
              value={date}
              onChangeText={setDate}
            />

            <View style={[styles.pickerContainer, { zIndex: 3000 }]}>
              <RegularText style={styles.pickerLabel}>
                Establecimiento
              </RegularText>
              <DropDownPicker
                open={openEmpresa}
                value={selectedEmpresa}
                items={empresaOptions}
                setOpen={setOpenEmpresa}
                setValue={setSelectedEmpresa}
                setItems={setEmpresaOptions}
                placeholder="Selecciona una empresa"
                searchable={true}
                searchPlaceholder="Buscar empresa..."
                listMode="MODAL"
                modalProps={{
                  animationType: 'slide',
                }}
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownContainer}
                searchContainerStyle={styles.searchContainer}
                searchTextInputStyle={styles.searchInput}
              />
            </View>

            <View style={[styles.pickerContainer, { zIndex: 2000 }]}>
              <RegularText style={styles.pickerLabel}>Campaña</RegularText>
              <DropDownPicker
                open={openCampania}
                value={selectedCampania}
                items={campaniaOptions}
                setOpen={setOpenCampania}
                setValue={setSelectedCampania}
                setItems={setCampaniaOptions}
                placeholder="Selecciona una campaña"
                searchable={true}
                searchPlaceholder="Buscar campaña..."
                disabled={campaniaOptions.length === 1}
                listMode="MODAL"
                modalProps={{
                  animationType: 'slide',
                }}
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownContainer}
                searchContainerStyle={styles.searchContainer}
                searchTextInputStyle={styles.searchInput}
              />
            </View>

            <View style={[styles.pickerContainer, { zIndex: 1000 }]}>
              <RegularText style={styles.pickerLabel}>
                Forma de Pago
              </RegularText>
              <DropDownPicker
                open={openFormaPago}
                value={selectedFormaPago}
                items={formasPagoOptions}
                setOpen={setOpenFormaPago}
                setValue={setSelectedFormaPago}
                setItems={setFormasPagoOptions}
                placeholder="Selecciona forma de pago"
                searchable={true}
                searchPlaceholder="Buscar forma de pago..."
                listMode="MODAL"
                modalProps={{
                  animationType: 'slide',
                }}
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownContainer}
                searchContainerStyle={styles.searchContainer}
                searchTextInputStyle={styles.searchInput}
              />
            </View>

            <Button
              title="Guardar Factura"
              onPress={addInvoice}
              style={styles.saveButton}
            />
          </Card>
        )}

        <View style={styles.invoicesSection}>
          <SemiBoldText style={styles.sectionTitle}>
            Facturas Pendientes
          </SemiBoldText>

          {invoices.map((invoice) => (
            <Card key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <SemiBoldText style={styles.invoiceNumber}>
                  Factura #{invoice.number}
                </SemiBoldText>
                <RegularText style={styles.pendingStatus}>
                  Pendiente
                </RegularText>
              </View>
              <RegularText>Monto: ${invoice.amount}</RegularText>
              <RegularText>Fecha: {invoice.date}</RegularText>
              <RegularText>Empresa: {invoice.empresa}</RegularText>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: Colors.light.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  addCard: {
    marginBottom: 16,
  },
  invoicesList: {
    padding: 16,
    paddingBottom: 32,
  },
  addCardTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: Colors.light.primary,
  },
  addCardSubtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 16,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButton: {
    alignItems: 'center',
    width: '30%',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.light.darkGray,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    color: Colors.light.primary,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    padding: 16,
    borderRadius: 8,
    width: '45%',
  },
  imageButtonText: {
    marginTop: 8,
    color: Colors.light.primary,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.red,
    padding: 8,
    borderRadius: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 8,
  },
  picker: {
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  dropDownContainer: {
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  searchContainer: {
    borderBottomColor: Colors.light.border,
  },
  searchInput: {
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 16,
  },
  invoicesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: Colors.light.text,
  },
  invoiceCard: {
    marginBottom: 12,
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  pendingStatus: {
    color: Colors.light.red,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
