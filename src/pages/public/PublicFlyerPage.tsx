import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../../lib/database';
import { AlertTriangle, MapPin, Calendar, Clock, Share2, Camera, ChevronLeft, AlertCircle } from 'lucide-react';
import { STATUS_DISPLAY, TYPE_DISPLAY } from '../../lib/workflows';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const PublicFlyerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const incident = useLiveQuery(
    () => id ? db.incidents.get(id) : undefined,
    [id]
  );

  if (incident === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Avis Introuvable</h1>
        <p className="text-slate-500 mb-8">Cet avis de recherche n'existe pas ou a été retiré.</p>
        <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const typeInfo = TYPE_DISPLAY[incident.type];
  const isResolved = incident.status === 'RETROUVE' || incident.status === 'CLOTURE' || incident.status === 'FAUSSE_ALERTE';

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center pb-20">
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dossier Public</span>
            <span className="font-mono text-xs text-white">#{incident.id.slice(0,8).toUpperCase()}</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* WANTED BANNER */}
        <div className={`py-4 text-center ${isResolved ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            {isResolved ? 'RETROUVÉ(E)' : 'AVIS DE RECHERCHE'}
          </h1>
          {!isResolved && (
            <p className="text-red-100 text-sm font-bold mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Signalement Officiel
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Photo */}
          <div className="aspect-[3/4] bg-slate-100 rounded-2xl mb-6 overflow-hidden relative shadow-inner border border-slate-200">
            {incident.photos?.[0] ? (
              <img src={incident.photos[0]} alt="Personne disparue" className={`w-full h-full object-cover ${isResolved ? 'grayscale' : ''}`} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Camera className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm font-medium uppercase tracking-widest">Aucune photo</span>
              </div>
            )}
            
            {/* Type badge overlapping */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 font-bold text-sm border border-slate-200">
              <span>{typeInfo.emoji}</span>
              <span className="text-slate-900">{typeInfo.label}</span>
            </div>
          </div>

          {/* Title & Desc */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3">
              {incident.title}
            </h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm">
              {incident.description || "Aucune description détaillée n'a été fournie."}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="flex items-center gap-1.5 text-red-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Lieu</span>
              </div>
              <p className="font-bold text-slate-900 text-sm truncate">{incident.location.arrondissement || 'Non précisé'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Signalé le</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {format(new Date(incident.createdAt), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center bg-slate-900 p-6 rounded-2xl text-white mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
              Aidez-nous à diffuser
            </p>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={window.location.href} size={120} />
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Scannez pour partager ce dossier<br/>ou signaler une observation
            </p>
          </div>
        </div>

        {/* Action Bottom Bar */}
        {!isResolved && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-30 flex justify-center">
            <div className="w-full max-w-md">
              <button 
                onClick={() => navigate(`/citoyen/observation/nouvelle?incidentId=${incident.id}`)}
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <AlertTriangle className="w-5 h-5" />
                J'AI VU CETTE PERSONNE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
