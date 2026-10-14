import { useState, useEffect } from 'react';
import { ref, update, get, onValue } from 'firebase/database';
import { db, auth, IMGBB_API_KEY } from '../firebase';
import { MonitorPlay, MessageSquare, QrCode, Tag, Upload, Video, Trash2, Link as LinkIcon, LogOut, Copy, Bell } from 'lucide-react';
import { signOut } from 'firebase/auth';

export default function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('media');
  const [imgbbKey, setImgbbKey] = useState(IMGBB_API_KEY || '');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploading, setUploading] = useState(false);

  // Overlay States
  const [announcement, setAnnouncement] = useState('');
  const [qrLink, setQrLink] = useState('');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');

  // Ticket (Senha) States
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketDesk, setTicketDesk] = useState('');

  // Load initial settings and current state from Firebase so fields don't reset on refresh
  useEffect(() => {
    if (!user) return;

    // Load API Key setting
    const keyRef = ref(db, `users/${user.uid}/settings`);
    get(keyRef).then((snapshot) => {
      if (snapshot.exists() && snapshot.val().imgbbKey) {
        setImgbbKey(snapshot.val().imgbbKey);
      } else if (IMGBB_API_KEY) {
        setImgbbKey(IMGBB_API_KEY);
      }
    });

    // Listen to display state to keep fields in sync with what's actually on TV
    const displayRef = ref(db, `users/${user.uid}/displayState`);
    const unsubscribe = onValue(displayRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.announcement?.text) setAnnouncement(data.announcement.text);
        if (data.qrCode?.url) setQrLink(data.qrCode.url);
        if (data.product) {
          setProductName(data.product.name || '');
          setProductDesc(data.product.desc || '');
          setProductPrice(data.product.price || '');
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const saveApiKey = async (key) => {
    setImgbbKey(key);
    if (key) {
      await update(ref(db, `users/${user.uid}/settings`), { imgbbKey: key });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const activeKey = imgbbKey || IMGBB_API_KEY;
    
    if (!file) return;

    if (!activeKey) {
      alert("Por favor, configure sua chave do ImgBB no arquivo src/firebase.js ou digite no campo da barra lateral.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${activeKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        await update(ref(db, `users/${user.uid}/displayState/background`), {
          type: 'image',
          url: data.data.url,
          timestamp: Date.now()
        });
        alert('Imagem definida como fundo na TV!');
      } else {
        alert('Erro no upload: ' + data.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeLink) return;
    let videoId = '';
    try {
      if (youtubeLink.includes('youtu.be/')) {
        videoId = youtubeLink.split('youtu.be/')[1].split('?')[0];
      } else if (youtubeLink.includes('youtube.com/watch')) {
        const url = new URL(youtubeLink);
        videoId = url.searchParams.get('v');
      } else {
        videoId = youtubeLink;
      }

      await update(ref(db, `users/${user.uid}/displayState/background`), {
        type: 'youtube',
        videoId: videoId,
        timestamp: Date.now()
      });
      alert('Vídeo definido como fundo na TV!');
      setYoutubeLink('');
    } catch (e) {
      alert('Link inválido!');
    }
  };

  const clearBackground = async () => {
    await update(ref(db, `users/${user.uid}/displayState/background`), { type: 'none' });
  };

  const handleUpdateAnnouncement = async () => {
    await update(ref(db, `users/${user.uid}/displayState/announcement`), {
      text: announcement,
      visible: !!announcement
    });
    alert('Letreiro atualizado na TV!');
  };

  const handleUpdateQR = async () => {
    await update(ref(db, `users/${user.uid}/displayState/qrCode`), {
      url: qrLink,
      visible: !!qrLink
    });
    alert('QR Code atualizado na TV!');
  };

  const handleUpdateProduct = async () => {
    await update(ref(db, `users/${user.uid}/displayState/product`), {
      name: productName,
      desc: productDesc,
      price: productPrice,
      visible: !!(productName || productPrice)
    });
    alert('Produto atualizado na TV!');
  };

  const handleCallTicket = async () => {
    if (!ticketNumber) return alert('Digite o número da senha.');
    
    await update(ref(db, `users/${user.uid}/displayState/ticket`), {
      number: ticketNumber,
      desk: ticketDesk || 'Recepção',
      timestamp: Date.now(),
      visible: true
    });
    alert('Senha chamada na TV!');
  };

  const clearOverlay = async (node) => {
    await update(ref(db, `users/${user.uid}/displayState/${node}`), { visible: false });
  };

  const handleLogout = () => signOut(auth);

  const tvLink = `${window.location.origin}/tv/${user?.uid}`;

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <MonitorPlay size={28} />
          <span>Signage.Pro</span>
        </div>
        
        <div className="nav-menu">
          <div className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            <MonitorPlay size={20} /> Fundo (Mídia)
          </div>
          <div className={`nav-item ${activeTab === 'announce' ? 'active' : ''}`} onClick={() => setActiveTab('announce')}>
            <MessageSquare size={20} /> Letreiro
          </div>
          <div className={`nav-item ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
            <QrCode size={20} /> QR Code
          </div>
          <div className={`nav-item ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
            <Tag size={20} /> Produto / Preço
          </div>
          <div className={`nav-item ${activeTab === 'ticket' ? 'active' : ''}`} onClick={() => setActiveTab('ticket')}>
            <Bell size={20} /> Chamar Senha
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* API Key Box */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>
              API Key do ImgBB {IMGBB_API_KEY ? '(Padrão ativa)' : ''}
            </label>
            <input 
              type="text" 
              value={imgbbKey} 
              onChange={(e) => saveApiKey(e.target.value)} 
              placeholder={IMGBB_API_KEY ? "Usando chave de firebase.js" : "Cole aqui e será salva..."} 
              style={{ padding: '0.75rem', fontSize: '0.85rem' }}
            />
          </div>

          <button onClick={handleLogout} className="nav-item" style={{ background: 'transparent', border: '1px solid var(--border-color)', width: '100%' }}>
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="admin-content">
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Gerenciador de Tela</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Controle o que está sendo exibido na sua TV em tempo real.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seu Link para abrir na TV:</div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{tvLink}</div>
            </div>
            <button 
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', width: 'auto', marginTop: 0 }} 
              onClick={() => { navigator.clipboard.writeText(tvLink); alert('Link copiado!'); }}
            >
              <Copy size={16} /> Copiar
            </button>
          </div>
        </div>

        {/* TAB: MEDIA */}
        {activeTab === 'media' && (
          <div className="admin-card glass-panel">
            <h2><MonitorPlay size={24} color="var(--accent-color)" /> Mídia de Fundo</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Defina a imagem ou vídeo que ficará rodando no fundo da tela.</p>

            <div className="grid-2">
              <div>
                <div className="form-group">
                  <label><Upload size={16} style={{display:'inline', marginRight:'5px'}} /> Enviar Nova Imagem</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading}
                  />
                  {uploading && <p style={{ marginTop: '10px', color: 'var(--accent-color)' }}>Fazendo upload mágico...</p>}
                </div>
              </div>
              
              <div>
                <div className="form-group">
                  <label><Video size={16} style={{display:'inline', marginRight:'5px'}} /> Link do YouTube</label>
                  <input 
                    type="text" 
                    value={youtubeLink} 
                    onChange={(e) => setYoutubeLink(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                  />
                </div>
                <button className="btn-primary" onClick={handleYoutubeSubmit}>
                  Transmitir Vídeo
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-primary btn-danger" onClick={clearBackground} style={{ width: 'auto' }}>
                <Trash2 size={18} /> Remover Mídia de Fundo
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANNOUNCEMENT */}
        {activeTab === 'announce' && (
          <div className="admin-card glass-panel">
            <h2><MessageSquare size={24} color="var(--accent-color)" /> Letreiro Rotativo</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Crie um aviso que ficará passando na parte inferior da tela.</p>

            <div className="form-group">
              <label>Texto do Letreiro</label>
              <input 
                type="text" 
                value={announcement} 
                onChange={(e) => setAnnouncement(e.target.value)} 
                placeholder="Ex: PROMOÇÃO HOJE! Compre 1 e leve 2..." 
              />
            </div>
            <div className="grid-2">
              <button className="btn-primary" onClick={handleUpdateAnnouncement}>Atualizar Letreiro</button>
              <button className="btn-primary btn-danger" onClick={() => clearOverlay('announcement')}>Ocultar Letreiro</button>
            </div>
          </div>
        )}

        {/* TAB: QR CODE */}
        {activeTab === 'qr' && (
          <div className="admin-card glass-panel">
            <h2><QrCode size={24} color="var(--accent-color)" /> QR Code na Tela</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Exiba um QR code para o seu cliente acessar o cardápio, site ou WhatsApp.</p>

            <div className="form-group">
              <label><LinkIcon size={16} style={{display:'inline', marginRight:'5px'}} /> Link de Destino</label>
              <input 
                type="text" 
                value={qrLink} 
                onChange={(e) => setQrLink(e.target.value)} 
                placeholder="https://wa.me/5511999999999" 
              />
            </div>
            <div className="grid-2">
              <button className="btn-primary" onClick={handleUpdateQR}>Exibir QR Code</button>
              <button className="btn-primary btn-danger" onClick={() => clearOverlay('qrCode')}>Ocultar QR Code</button>
            </div>
          </div>
        )}

        {/* TAB: PRODUCT / PRICE */}
        {activeTab === 'product' && (
          <div className="admin-card glass-panel">
            <h2><Tag size={24} color="var(--accent-color)" /> Destaque de Produto</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Mostre um produto em destaque com nome, descrição e preço.</p>

            <div className="form-group">
              <label>Nome do Produto</label>
              <input 
                type="text" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                placeholder="Ex: Hambúrguer Artesanal" 
              />
            </div>
            <div className="form-group">
              <label>Descrição Opcional</label>
              <input 
                type="text" 
                value={productDesc} 
                onChange={(e) => setProductDesc(e.target.value)} 
                placeholder="Ex: Pão brioche, blend 180g, queijo cheddar..." 
              />
            </div>
            <div className="form-group">
              <label>Preço</label>
              <input 
                type="text" 
                value={productPrice} 
                onChange={(e) => setProductPrice(e.target.value)} 
                placeholder="Ex: R$ 29,90" 
              />
            </div>
            <div className="grid-2">
              <button className="btn-primary" onClick={handleUpdateProduct}>Exibir Produto</button>
              <button className="btn-primary btn-danger" onClick={() => clearOverlay('product')}>Ocultar Produto</button>
            </div>
          </div>
        )}

        {/* TAB: TICKET (SENHAS) */}
        {activeTab === 'ticket' && (
          <div className="admin-card glass-panel">
            <h2><Bell size={24} color="var(--accent-color)" /> Painel de Senhas</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Chame os clientes na TV informando a Senha e o Guichê/Consultório.</p>

            <div className="grid-2">
              <div className="form-group">
                <label>Número da Senha</label>
                <input 
                  type="text" 
                  value={ticketNumber} 
                  onChange={(e) => setTicketNumber(e.target.value)} 
                  placeholder="Ex: A-042" 
                  style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>
              <div className="form-group">
                <label>Guichê / Local (Opcional)</label>
                <input 
                  type="text" 
                  value={ticketDesk} 
                  onChange={(e) => setTicketDesk(e.target.value)} 
                  placeholder="Ex: Caixa 02" 
                />
              </div>
            </div>
            
            <button className="btn-primary" onClick={handleCallTicket} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              <Bell size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Chamar na TV
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
