import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText, BoldText } from '@/components/StyledText';
import Card from '@/components/ui/Card';
import {
  ArrowLeft,
  CalendarFold,
  CircleCheck as CheckCircle2,
  FileCheck,
} from 'lucide-react-native';
import { getAuthToken, getFromStorage, getUserInfo } from '@/utils/storage';
interface UserData {
  ID_CUENTAS?: number;
  tokenable_id?: number;
}

interface CanjeItem {
  ID_CANJESDETALLE?: number;
  ESTADO_CANJESDETALLE: string;
  NUMEROFACTURAS_CANJESDETALLE: string | number;
  FECHA_CANJES: string;
  MONTOFACTURAS_CANJESDETALLE: number | string;
  COMENTARIO_CANJESDETALLE?: string;
  scr_canje?: {
    scr_ganadores?: any[];
    scr_campania?: {
      NOMBRE_CAMPANIAS?: string;
    };
    scr_cuenta?: {
      NOMBRE_CUENTAS?: string;
      APELLIDO_CUENTAS?: string;
    };
  };
  trb_empresa?: {
    NOMBRECOMERCIAL_EMPRESA?: string;
  };
  scr_formadepago?: {
    NOMBRE_FORMADEPAGO?: string;
  };
}

const url = 'https://backend.ccelrecreo.com/server.php/api';

export default function RedeemedInvoicesScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedComentario, setSelectedComentario] = useState('');

  const getBadgeColor = (estado: any) => {
    switch (estado) {
      case 'R':
        return Colors.light.danger;
      case 'A':
        return Colors.light.success;
      default:
        return Colors.light.darkGray;
    }
  };

  const getBadgeText = (estado: any) => {
    switch (estado) {
      case 'R':
        return 'Rechazado';
      case 'A':
        return 'Aprobado';
      default:
        return 'Pendiente';
    }
  };

  const getCanjes = useCallback(
    async (page = 1) => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await axios.post(`${url}/detallesGanadores`, {
          cuenta: userId,
          page,
        });

        const data = response.data;

        if (data.status === 'success') {
          setCanjes((prevCanjes) =>
            page === 1 ? data.data.data : [...prevCanjes, ...data.data.data]
          );
          setCurrentPage(data.data.current_page);
          setTotalPages(data.data.last_page);
        } else {
          setCanjes([]);
        }
      } catch (error) {
        console.error('Error fetching canjes:', error);
        setCanjes([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getAuthToken();
        console.log('Token:', token);

        const userData: UserData | null = await getUserInfo();
        console.log('User:', userData);

        if (userData) {
          const cuentaId = userData.ID_CUENTAS || userData.tokenable_id;
          console.log('cuentaId:', cuentaId);
          setUserId(cuentaId || null);
          getCanjes(1);
        }
      } catch (error) {
        console.error('Error reading user data from storage:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      getCanjes(1);
    }
  }, [userId]);

  useEffect(() => {
    if (currentPage > 1) {
      getCanjes(currentPage);
    }
  }, [currentPage, getCanjes]);

  const handleShowModal = (comentario: React.SetStateAction<string>) => {
    setSelectedComentario(comentario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComentario('');
  };

  const renderInvoice = ({ item }: { item: CanjeItem }) => {
    const isRejected = item.ESTADO_CANJESDETALLE === 'R';

    return (
      <Card style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <View>
            <SemiBoldText style={styles.invoiceNumber}>
              #{item.NUMEROFACTURAS_CANJESDETALLE}
            </SemiBoldText>
            <RegularText style={styles.invoiceDate}>
              Fecha: {item.FECHA_CANJES}
            </RegularText>
          </View>
          <CheckCircle2
            size={24}
            color={
              (item.scr_canje?.scr_ganadores?.length ?? 0) > 0
                ? Colors.light.success
                : Colors.light.darkGray
            }
          />
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.detailRow}>
            <RegularText style={styles.detailLabel}>Campaña:</RegularText>
            <SemiBoldText style={styles.detailValue}>
              {item.scr_canje?.scr_campania?.NOMBRE_CAMPANIAS || '-'}
            </SemiBoldText>
          </View>

          <View style={styles.detailRow}>
            <RegularText style={styles.detailLabel}>Cuenta:</RegularText>
            <SemiBoldText style={styles.detailValue}>
              {item.scr_canje?.scr_cuenta
                ? `${item.scr_canje.scr_cuenta.NOMBRE_CUENTAS} ${item.scr_canje.scr_cuenta.APELLIDO_CUENTAS}`
                : '-'}
            </SemiBoldText>
          </View>

          <View style={styles.detailRow}>
            <RegularText style={styles.detailLabel}>
              Establecimiento:
            </RegularText>
            <SemiBoldText style={styles.detailValue}>
              {item.trb_empresa?.NOMBRECOMERCIAL_EMPRESA || 'marca'}
            </SemiBoldText>
          </View>

          <View style={styles.detailRow}>
            <RegularText style={styles.detailLabel}>Monto:</RegularText>
            <SemiBoldText style={styles.detailValue}>
              ${item.MONTOFACTURAS_CANJESDETALLE}
            </SemiBoldText>
          </View>

          <View style={styles.detailRow}>
            <RegularText style={styles.detailLabel}>Medio de Pago:</RegularText>
            <SemiBoldText style={styles.detailValue}>
              {item.scr_formadepago?.NOMBRE_FORMADEPAGO || '-'}
            </SemiBoldText>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getBadgeColor(item.ESTADO_CANJESDETALLE) + '33',
              },
            ]}
          >
            <RegularText
              style={[
                styles.statusText,
                { color: getBadgeColor(item.ESTADO_CANJESDETALLE) },
              ]}
            >
              {getBadgeText(item.ESTADO_CANJESDETALLE)}
            </RegularText>
          </View>

          {isRejected && (
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                handleShowModal(item.COMENTARIO_CANJESDETALLE ?? '')
              }
            >
              <RegularText style={styles.detailsButtonText}>
                Ver Más Detalles
              </RegularText>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft size={24} color="#fff" onPress={() => router.back()} />
        <FileCheck
          size={24}
          color={Colors.light.white}
          style={styles.icon}
        />
        <BoldText style={styles.title}>Facturas Canjeadas</BoldText>
      </View>

      <View style={styles.content}>
        {loading && canjes.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.light.primary} />
        ) : canjes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <RegularText style={styles.emptyText}>
              No tienes facturas canjeadas
            </RegularText>
          </Card>
        ) : (
          <FlatList
            data={canjes}
            renderItem={renderInvoice}
            keyExtractor={(item) => {
              if (item.ID_CANJESDETALLE != null)
                return item.ID_CANJESDETALLE.toString();
              if (item.NUMEROFACTURAS_CANJESDETALLE != null)
                return item.NUMEROFACTURAS_CANJESDETALLE.toString();
              return Math.random().toString();
            }}
            contentContainerStyle={styles.listContainer}
            onEndReached={() => {
              if (currentPage < totalPages && !loading) {
                setCurrentPage((prev) => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && canjes.length > 0 ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : null
            }
          />
        )}
      </View>

      {/* Modal Comentario */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <BoldText style={styles.modalTitle}>Comentario del Canje</BoldText>
            <RegularText style={styles.modalBody}>
              {selectedComentario || 'Sin comentarios'}
            </RegularText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <RegularText style={styles.closeButtonText}>Cerrar</RegularText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    color: Colors.light.white,
    marginLeft: 10,
  },

  icon: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 16,
  },
  invoiceCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#777',
  },
  invoiceDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  detailLabel: {
    flex: 1,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#555',
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  detailsButton: {
    marginTop: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
