import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RegularText, SemiBoldText } from '../StyledText';
import Colors from '@/constants/Colors';
import { User, Bell, Clock, Trash2, LogOut } from 'lucide-react-native';

type UserProfileProps = {
  name: string;
  id: string;
  onProfilePress: () => void;
  onNotificationsPress: () => void;
  onActivityPress: () => void;
  onDeleteAccountPress: () => void;
  onLogoutPress: () => void;
};

export default function UserProfile({
  name,
  id,
  onProfilePress,
  onNotificationsPress,
  onActivityPress,
  onDeleteAccountPress,
  onLogoutPress,
}: UserProfileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={40} color={Colors.light.primary} />
        </View>
        <View style={styles.infoContainer}>
          <SemiBoldText style={styles.name}>{name}</SemiBoldText>
          <RegularText style={styles.id}>{id}</RegularText>
        </View>
      </View>
      
      <View style={styles.menuContainer}>
        <MenuItem 
          icon={<User size={24} color={Colors.light.primary} />}
          label="Perfil"
          onPress={onProfilePress}
        />
        
        <MenuItem 
          icon={<Bell size={24} color={Colors.light.primary} />}
          label="Notificaciones"
          onPress={onNotificationsPress}
        />
        
        <MenuItem 
          icon={<Clock size={24} color={Colors.light.primary} />}
          label="Actividad reciente"
          onPress={onActivityPress}
        />
        
        <MenuItem 
          icon={<Trash2 size={24} color={Colors.light.primary} />}
          label="Eliminar mi cuenta"
          onPress={onDeleteAccountPress}
        />
        
        <MenuItem 
          icon={<LogOut size={24} color={Colors.light.primary} />}
          label="Cerrar sesión"
          onPress={onLogoutPress}
          isLast
        />
      </View>
    </View>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLast?: boolean;
};

function MenuItem({ icon, label, onPress, isLast = false }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && styles.lastMenuItem]} 
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>{icon}</View>
      <RegularText style={styles.menuLabel}>{label}</RegularText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  id: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 18,
    color: Colors.light.primary,
  },
});