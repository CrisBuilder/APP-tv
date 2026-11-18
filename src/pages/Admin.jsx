import { useState, useEffect } from 'react';
import { ref, get, onValue } from 'firebase/database';
import { db, IMGBB_API_KEY } from '../firebase';
import { subscribeUserDisplays, saveDisplay } from '../services/displayService';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import PairingModal from '../components/PairingModal';
import LivePreviewModal from '../components/LivePreviewModal';

import DisplaysTab from '../components/tabs/DisplaysTab';
import MediaTab from '../components/tabs/MediaTab';
import AnnouncementTab from '../components/tabs/AnnouncementTab';
import ProductTab from '../components/tabs/ProductTab';
import QrTab from '../components/tabs/QrTab';
import TicketTab from '../components/tabs/TicketTab';
import BillingTab from '../components/tabs/BillingTab';
import SettingsTab from '../components/tabs/SettingsTab';

export default function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('displays');
  const [displays, setDisplays] = useState([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState('all');
  const [imgbbKey, setImgbbKey] = useState(IMGBB_API_KEY || '');
  const [profile, setProfile] = useState({ name: '', city: '' });
  const [currentState, setCurrentState] = useState({});

  // Modais
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Escuta telas e configurações do usuário no Firebase
  useEffect(() => {
    if (!user?.uid) return;

    // 1. Ouve a lista de displays em tempo real
    const unsubDisplays = subscribeUserDisplays(user.uid, (list) => {
      setDisplays(list);
      // Se não houver telas, cria automaticamente a TV Principal padrão para o usuário
      if (list.length === 0) {
        saveDisplay(user.uid, { name: 'TV Principal', location: 'Recepção' });
      }
    });

    // 2. Carrega Perfil e Configurações de API
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.profile) setProfile(data.profile);
        if (data.settings?.imgbbKey) {
          setImgbbKey(data.settings.imgbbKey);
        } else if (IMGBB_API_KEY) {
          setImgbbKey(IMGBB_API_KEY);
        }
      }
    });

    // 3. Ouve o estado atual para preencher campos
    const stateRef = ref(db, `users/${user.uid}/displayState`);
    const unsubState = onValue(stateRef, (snapshot) => {
      if (snapshot.exists()) setCurrentState(snapshot.val());
    });

    return () => {
      unsubDisplays();
      unsubState();
    };
  }, [user]);

  return (
    <div className="df-layout">
      {/* Sidebar Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        displaysCount={displays.length}
      />

      <div className="df-main">
        {/* Topbar com Seletor Global de TV */}
        <Navbar
          displays={displays}
          selectedDisplayId={selectedDisplayId}
          setSelectedDisplayId={setSelectedDisplayId}
          onOpenPreview={() => setIsPreviewModalOpen(true)}
          onOpenPairModal={() => setIsPairModalOpen(true)}
          user={user}
        />

        {/* Área Central de Conteúdo */}
        <main className="df-content">
          {activeTab === 'displays' && (
            <DisplaysTab
              displays={displays}
              selectedDisplayId={selectedDisplayId}
              setSelectedDisplayId={setSelectedDisplayId}
              onOpenPairModal={() => setIsPairModalOpen(true)}
              user={user}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              user={user}
              displays={displays}
              selectedDisplayId={selectedDisplayId}
              imgbbKey={imgbbKey}
            />
          )}

          {activeTab === 'announce' && (
            <AnnouncementTab
              user={user}
              displays={displays}
              selectedDisplayId={selectedDisplayId}
              initialText={currentState.announcement?.text || ''}
            />
          )}

          {activeTab === 'product' && (
            <ProductTab
              user={user}
              displays={displays}
              selectedDisplayId={selectedDisplayId}
              initialProduct={currentState.product || {}}
            />
          )}

          {activeTab === 'qr' && (
            <QrTab
              user={user}
              displays={displays}
              selectedDisplayId={selectedDisplayId}
              initialUrl={currentState.qrCode?.url || ''}
            />
          )}

          {activeTab === 'ticket' && (
            <TicketTab
              user={user}
              displays={displays}
              selectedDisplayId={selectedDisplayId}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab user={user} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              user={user}
              profile={profile}
              imgbbKey={imgbbKey}
              onUpdateProfile={setProfile}
              onUpdateImgbbKey={setImgbbKey}
            />
          )}
        </main>
      </div>

      {/* Barra de Navegação Inferior (Mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modais Globais */}
      <PairingModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        user={user}
        onDisplayCreated={(newD) => setSelectedDisplayId(newD.id)}
      />

      <LivePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        user={user}
        displays={displays}
        initialDisplayId={selectedDisplayId}
      />
    </div>
  );
}
