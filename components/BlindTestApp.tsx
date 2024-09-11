import dynamic from 'next/dynamic';
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, MinusCircle, Play, Pause, RotateCcw, Edit, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Confetti from 'react-confetti';

// Charger le composant YouTube seulement côté client
const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

const extractYouTubeId = (url: string) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=|.+\/v\/|.+\/embed\/|user\/\w+\/videos|playlist\?list=|shorts\/)?([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
};

const BlindTestApp = () => {
  const [songs, setSongs] = useLocalStorage('blindTestSongs', []);
  const [players, setPlayers] = useLocalStorage('blindTestPlayers', []);
  const [isClient, setIsClient] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [newSong, setNewSong] = useState({ title: '', answer: '', youtubeUrl: '' });
  const playerRef = useRef<any>(null);
  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);

  // Ajoute une fonction pour afficher le modal
  const endGame = () => {
      setIsEndGameModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
      setIsEndGameModalOpen(false);
  };

const sortedPlayers = [...players].sort((a, b) => b.score - a.score);


  useEffect(() => {
    setIsClient(true); // On vérifie si on est côté client
  }, []);

  if (!isClient) {
    return null; // Ne pas rendre le composant tant qu'on est pas côté client
  }

  const handleAddSong = () => {
    const youtubeId = extractYouTubeId(newSong.youtubeUrl);
    if (newSong.title.trim() && newSong.answer.trim() && youtubeId) {
      const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
      setSongs([...songs, { id: newId, title: newSong.title, answer: newSong.answer, youtubeId, revealed: false }]);
      setNewSong({ title: '', answer: '', youtubeUrl: '' });
    }
  };

  const handleDeleteSong = (id: number) => {
    setSongs(songs.filter(song => song.id !== id));
  };

  const toggleReveal = (id: number) => {
    setSongs(songs.map(song =>
      song.id === id ? { ...song, revealed: !song.revealed } : song
    ));
  };

  const updateScore = (id: number, increment: number) => {
    setPlayers(players.map(player =>
      player.id === id ? { ...player, score: player.score + increment } : player
    ));
  };

  const addPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName) {
      if (players.some(player => player.name.toLowerCase() === trimmedName.toLowerCase())) {
        setErrorMessage('Un joueur avec ce nom existe déjà.');
      } else {
        const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
        setPlayers([...players, { id: newId, name: trimmedName, score: 0 }]);
        setNewPlayerName('');
        setErrorMessage('');
      }
    } else {
      setErrorMessage('Le nom du joueur ne peut pas être vide.');
    }
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  const togglePlay = (id: number) => {
    if (currentlyPlaying === id) {
      playerRef.current?.pauseVideo();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        playerRef.current?.pauseVideo();
      }
      const song = songs.find(s => s.id === id);
      if (song) {
        playerRef.current?.loadVideoById(song.youtubeId);
        playerRef.current?.playVideo();
        setCurrentlyPlaying(id);
      }
    }
  };

  const saveSong = () => {
    if (editingSong) {
      setSongs(songs.map(song =>
        song.id === editingSong.id ? editingSong : song
      ));
      setEditingSong(null);
    }
  };

  const updateEditingSong = (field: string, value: string) => {
    setEditingSong({ ...editingSong, [field]: value });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-3/4 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">Blind Test</h1>
         {/* Ajouter le bouton "Terminer la partie" */}
         <Button onClick={endGame} className="mb-6 bg-red-500 hover:bg-red-600 text-white">
                    Terminer la partie
        </Button>
        <div className="mb-6 p-4 bg-white shadow-lg">
          <h2 className="text-xl font-bold mb-4">Ajouter une chanson</h2>
          <Input
            value={newSong.title}
            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
            placeholder="Titre ou Indice"
            className="mb-2"
          />
          <Input
            value={newSong.answer}
            onChange={(e) => setNewSong({ ...newSong, answer: e.target.value })}
            placeholder="Réponse"
            className="mb-2"
          />
          <Input
            value={newSong.youtubeUrl}
            onChange={(e) => setNewSong({ ...newSong, youtubeUrl: e.target.value })}
            placeholder="URL YouTube"
            className="mb-2"
          />
          <Button onClick={handleAddSong} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            Ajouter
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map(song => (
            <Card key={song.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {editingSong && editingSong.id === song.id ? (
                  <div className="space-y-4">
                    <Input 
                      value={editingSong.title} 
                      onChange={(e) => updateEditingSong('title', e.target.value)}
                      placeholder="Titre de la chanson"
                    />
                    <Input 
                      value={editingSong.answer} 
                      onChange={(e) => updateEditingSong('answer', e.target.value)}
                      placeholder="Réponse"
                    />
                    <Input 
                      value={editingSong.youtubeUrl} 
                      onChange={(e) => updateEditingSong('youtubeUrl', e.target.value)}
                      placeholder="URL YouTube"
                    />
                    <Button onClick={saveSong} className="w-full bg-green-500 hover:bg-green-600 text-white">
                      <Save className="h-4 w-4 mr-2" /> Sauvegarder
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{song.title}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <Button variant="outline" size="icon" onClick={() => togglePlay(song.id)} className="bg-indigo-600 hover:bg-indigo-200 text-indigo-600">
                        {currentlyPlaying === song.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => toggleReveal(song.id)} className="bg-yellow-300 hover:bg-yellow-200 text-yellow-600">
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-200 text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    {song.revealed && (
                      <p className="mt-2 p-2 bg-green-100 text-green-800 rounded">{song.answer}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-full md:w-1/4 p-6 bg-white shadow-lg flex flex-col h-screen md:h-auto">
        <h2 className="text-2xl font-bold mb-6 text-indigo-600">Joueurs</h2>
        <div className="flex-grow overflow-auto mb-6">
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{player.name}: {player.score}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => updateScore(player.id, 1)} className="bg-green-600 hover:bg-green-200 text-green-600">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => updateScore(player.id, -1)} className="bg-red-500 hover:bg-red-200 text-red-600">
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => removePlayer(player.id)} className="bg-gray-500 hover:bg-gray-200 text-gray-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <Input
            type="text"
            placeholder="Nom du nouveau joueur"
            value={newPlayerName}
            onChange={(e) => {
              setNewPlayerName(e.target.value);
              setErrorMessage('');
            }}
            className="mb-2 w-full"
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
          )}
          <Button onClick={addPlayer} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            Ajouter un joueur
          </Button>
        </div>
      </div>
      {isEndGameModalOpen && (
                <>
                    <Confetti />
                    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                        <div className="p-6 bg-white rounded shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Podium des Scores</h2>
                            <ul>
                                {sortedPlayers.map((player, index) => (
                                    <li key={player.id} className="mb-2">
                                        <span className="font-semibold">{index + 1}. {player.name}:</span> {player.score} points
                                    </li>
                                ))}
                            </ul>
                            <Button onClick={closeModal} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </>
            )}
      <YouTube
        videoId=""
        opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
        onReady={(event) => (playerRef.current = event.target)}
      />
    </div>
  );
};

export default BlindTestApp;
